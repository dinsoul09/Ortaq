use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("AaJbysPdFFNc5anUvuMycEXvbyki7HUaUAMtZVPmUXgt");

#[program]
pub mod ortaq {
    use super::*;

    pub fn create_pool(
        ctx: Context<CreatePool>,
        pool_id: u64,
        goal: u64,
        duration_secs: i64,
    ) -> Result<()> {
        require!(goal > 0, PoolError::InvalidGoal);
        require!(duration_secs > 0, PoolError::InvalidDuration);

        let clock = Clock::get()?;
        let pool = &mut ctx.accounts.pool;

        pool.pool_id = pool_id;
        pool.organizer = ctx.accounts.organizer.key();
        pool.recipient = ctx.accounts.recipient.key();
        pool.mint = ctx.accounts.mint.key();
        pool.goal = goal;
        pool.deadline = clock.unix_timestamp + duration_secs;
        pool.raised = 0;
        pool.contributor_count = 0;
        pool.status = STATUS_ACTIVE;
        pool.bump = ctx.bumps.pool;

        Ok(())
    }

    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        require!(amount > 0, PoolError::InvalidAmount);

        let clock = Clock::get()?;
        require!(ctx.accounts.pool.status == STATUS_ACTIVE, PoolError::PoolNotActive);
        require!(clock.unix_timestamp < ctx.accounts.pool.deadline, PoolError::DeadlinePassed);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.contributor_token.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.contributor.to_account_info(),
                },
            ),
            amount,
        )?;

        let is_first = ctx.accounts.contribution.amount == 0;
        let pool_key = ctx.accounts.pool.key();

        let c = &mut ctx.accounts.contribution;
        if is_first {
            c.pool = pool_key;
            c.contributor = ctx.accounts.contributor.key();
            c.refunded = false;
            c.bump = ctx.bumps.contribution;
        }
        c.amount = c.amount.checked_add(amount).ok_or(PoolError::Overflow)?;

        let pool = &mut ctx.accounts.pool;
        if is_first {
            pool.contributor_count = pool.contributor_count.checked_add(1).ok_or(PoolError::Overflow)?;
        }
        pool.raised = pool.raised.checked_add(amount).ok_or(PoolError::Overflow)?;

        Ok(())
    }

    /// Вызвать может кто угодно. Деньги всё равно уйдут только получателю.
    pub fn release(ctx: Context<Release>) -> Result<()> {
        require!(ctx.accounts.pool.status == STATUS_ACTIVE, PoolError::PoolNotActive);
        require!(
            ctx.accounts.pool.raised >= ctx.accounts.pool.goal,
            PoolError::GoalNotReached
        );

        let organizer = ctx.accounts.pool.organizer;
        let pool_id = ctx.accounts.pool.pool_id.to_le_bytes();
        let bump = ctx.accounts.pool.bump;
        let seeds: &[&[u8]] = &[b"pool", organizer.as_ref(), &pool_id, &[bump]];
        let signer: &[&[&[u8]]] = &[seeds];

        let amount = ctx.accounts.vault.amount;

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.recipient_token.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        ctx.accounts.pool.status = STATUS_RELEASED;
        Ok(())
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        let clock = Clock::get()?;

        require!(ctx.accounts.pool.status == STATUS_ACTIVE, PoolError::PoolNotActive);
        require!(clock.unix_timestamp >= ctx.accounts.pool.deadline, PoolError::DeadlineNotPassed);
        require!(ctx.accounts.pool.raised < ctx.accounts.pool.goal, PoolError::GoalWasReached);
        require!(!ctx.accounts.contribution.refunded, PoolError::AlreadyRefunded);
        require!(ctx.accounts.contribution.amount > 0, PoolError::NothingToRefund);

        // флаг поднимаем ДО перевода
        ctx.accounts.contribution.refunded = true;
        let amount = ctx.accounts.contribution.amount;

        let organizer = ctx.accounts.pool.organizer;
        let pool_id = ctx.accounts.pool.pool_id.to_le_bytes();
        let bump = ctx.accounts.pool.bump;
        let seeds: &[&[u8]] = &[b"pool", organizer.as_ref(), &pool_id, &[bump]];
        let signer: &[&[&[u8]]] = &[seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.contributor_token.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        let pool = &mut ctx.accounts.pool;
        pool.raised = pool.raised.checked_sub(amount).ok_or(PoolError::Overflow)?;
        if pool.raised == 0 {
            pool.status = STATUS_REFUNDED;
        }

        Ok(())
    }
}

pub const STATUS_ACTIVE: u8 = 0;
pub const STATUS_RELEASED: u8 = 1;
pub const STATUS_REFUNDED: u8 = 2;

#[account]
pub struct Pool {
    pub pool_id: u64,
    pub organizer: Pubkey,
    pub recipient: Pubkey,
    pub mint: Pubkey,
    pub goal: u64,
    pub deadline: i64,
    pub raised: u64,
    pub contributor_count: u32,
    pub status: u8,
    pub bump: u8,
}

impl Pool {
    // 8 + 32 + 32 + 32 + 8 + 8 + 8 + 4 + 1 + 1
    pub const LEN: usize = 134;
}

#[account]
pub struct Contribution {
    pub pool: Pubkey,
    pub contributor: Pubkey,
    pub amount: u64,
    pub refunded: bool,
    pub bump: u8,
}

impl Contribution {
    // 32 + 32 + 8 + 1 + 1
    pub const LEN: usize = 74;
}

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub organizer: Signer<'info>,

    /// CHECK: нужен только адрес, записывается в состояние и больше не меняется
    pub recipient: UncheckedAccount<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = organizer,
        space = 8 + Pool::LEN,
        seeds = [b"pool", organizer.key().as_ref(), &pool_id.to_le_bytes()],
        bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
        init,
        payer = organizer,
        token::mint = mint,
        token::authority = pool,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.organizer.as_ref(), &pool.pool_id.to_le_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(mut, seeds = [b"vault", pool.key().as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = contributor_token.owner == contributor.key() @ PoolError::WrongOwner,
        constraint = contributor_token.mint == pool.mint @ PoolError::WrongMint
    )]
    pub contributor_token: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = contributor,
        space = 8 + Contribution::LEN,
        seeds = [b"contrib", pool.key().as_ref(), contributor.key().as_ref()],
        bump
    )]
    pub contribution: Account<'info, Contribution>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Release<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.organizer.as_ref(), &pool.pool_id.to_le_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(mut, seeds = [b"vault", pool.key().as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = recipient_token.owner == pool.recipient @ PoolError::WrongOwner,
        constraint = recipient_token.mint == pool.mint @ PoolError::WrongMint
    )]
    pub recipient_token: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.organizer.as_ref(), &pool.pool_id.to_le_bytes()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(mut, seeds = [b"vault", pool.key().as_ref()], bump)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = contributor_token.owner == contributor.key() @ PoolError::WrongOwner
    )]
    pub contributor_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"contrib", pool.key().as_ref(), contributor.key().as_ref()],
        bump = contribution.bump
    )]
    pub contribution: Account<'info, Contribution>,

    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum PoolError {
    #[msg("Цель должна быть больше нуля")]
    InvalidGoal,
    #[msg("Срок должен быть больше нуля")]
    InvalidDuration,
    #[msg("Сумма должна быть больше нуля")]
    InvalidAmount,
    #[msg("Сбор уже закрыт")]
    PoolNotActive,
    #[msg("Срок сбора истёк")]
    DeadlinePassed,
    #[msg("Срок сбора ещё не истёк")]
    DeadlineNotPassed,
    #[msg("Цель не собрана, деньги забрать нельзя")]
    GoalNotReached,
    #[msg("Цель была достигнута, возврат невозможен")]
    GoalWasReached,
    #[msg("Возврат уже получен")]
    AlreadyRefunded,
    #[msg("Нечего возвращать")]
    NothingToRefund,
    #[msg("Неверный владелец токен-аккаунта")]
    WrongOwner,
    #[msg("Неверный токен")]
    WrongMint,
    #[msg("Переполнение")]
    Overflow,
}