import { useState } from 'react'
import { MAX_NAME } from '../lib/wallet'
import { Back, Field, Label, PrimaryButton, Screen, Title, TopGlow } from '../components/ui'

/**
 * Имя спрашиваем один раз, сразу после кошелька. Адрес говорит, кто внёс,
 * но список участников читается с расстояния только по именам.
 *
 * Отсюда же имя меняется: попасть сюда можно по аватару в шапке.
 */
export function Name({
  initial = '',
  onSave,
  onBack,
}: {
  initial?: string
  onSave: (name: string) => void
  onBack?: () => void
}) {
  const [value, setValue] = useState(initial)
  const ready = Boolean(value.trim())

  return (
    <>
      <TopGlow />
      <Screen>
        {onBack && <Back onClick={onBack} />}

        <div className="pt-6">
          <Title>Как вас зовут?</Title>
          <p className="mt-3 text-[14px] leading-normal text-white/45">
            Имя увидят участники рядом с вашим взносом. Кошелёк уже подключён —
            менять имя можно когда угодно.
          </p>
        </div>

        <div className="mt-7">
          <Label>Имя</Label>
          <Field
            autoFocus
            value={value}
            maxLength={MAX_NAME}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Карим А."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && ready) onSave(value)
            }}
          />
        </div>

        <div className="mt-auto pt-8">
          <PrimaryButton disabled={!ready} onClick={() => onSave(value)}>
            {initial ? 'Сохранить' : 'Продолжить'}
          </PrimaryButton>
        </div>
      </Screen>
    </>
  )
}
