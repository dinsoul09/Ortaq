/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ortaq.json`.
 */
export type Ortaq = {
  "address": "AaJbysPdFFNc5anUvuMycEXvbyki7HUaUAMtZVPmUXgt",
  "metadata": {
    "name": "ortaq",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "contribute",
      "discriminator": [
        82,
        33,
        68,
        131,
        32,
        0,
        205,
        95
      ],
      "accounts": [
        {
          "name": "contributor",
          "writable": true,
          "signer": true
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.organizer",
                "account": "pool"
              },
              {
                "kind": "account",
                "path": "pool.poolId",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "contributorToken",
          "writable": true
        },
        {
          "name": "contribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "contributor"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createPool",
      "discriminator": [
        233,
        146,
        209,
        142,
        207,
        104,
        64,
        188
      ],
      "accounts": [
        {
          "name": "organizer",
          "writable": true,
          "signer": true
        },
        {
          "name": "recipient"
        },
        {
          "name": "mint"
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "organizer"
              },
              {
                "kind": "arg",
                "path": "poolId"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "poolId",
          "type": "u64"
        },
        {
          "name": "goal",
          "type": "u64"
        },
        {
          "name": "durationSecs",
          "type": "i64"
        }
      ]
    },
    {
      "name": "refund",
      "discriminator": [
        2,
        96,
        183,
        251,
        63,
        208,
        46,
        46
      ],
      "accounts": [
        {
          "name": "contributor",
          "writable": true,
          "signer": true
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.organizer",
                "account": "pool"
              },
              {
                "kind": "account",
                "path": "pool.poolId",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "contributorToken",
          "writable": true
        },
        {
          "name": "contribution",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "account",
                "path": "contributor"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "release",
      "docs": [
        "Вызвать может кто угодно. Деньги всё равно уйдут только получателю."
      ],
      "discriminator": [
        253,
        249,
        15,
        206,
        28,
        127,
        193,
        241
      ],
      "accounts": [
        {
          "name": "caller",
          "writable": true,
          "signer": true
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "pool.organizer",
                "account": "pool"
              },
              {
                "kind": "account",
                "path": "pool.poolId",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool"
              }
            ]
          }
        },
        {
          "name": "recipientToken",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "contribution",
      "discriminator": [
        182,
        187,
        14,
        111,
        72,
        167,
        242,
        212
      ]
    },
    {
      "name": "pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidGoal",
      "msg": "Цель должна быть больше нуля"
    },
    {
      "code": 6001,
      "name": "invalidDuration",
      "msg": "Срок должен быть больше нуля"
    },
    {
      "code": 6002,
      "name": "invalidAmount",
      "msg": "Сумма должна быть больше нуля"
    },
    {
      "code": 6003,
      "name": "poolNotActive",
      "msg": "Сбор уже закрыт"
    },
    {
      "code": 6004,
      "name": "deadlinePassed",
      "msg": "Срок сбора истёк"
    },
    {
      "code": 6005,
      "name": "deadlineNotPassed",
      "msg": "Срок сбора ещё не истёк"
    },
    {
      "code": 6006,
      "name": "goalNotReached",
      "msg": "Цель не собрана, деньги забрать нельзя"
    },
    {
      "code": 6007,
      "name": "goalWasReached",
      "msg": "Цель была достигнута, возврат невозможен"
    },
    {
      "code": 6008,
      "name": "alreadyRefunded",
      "msg": "Возврат уже получен"
    },
    {
      "code": 6009,
      "name": "nothingToRefund",
      "msg": "Нечего возвращать"
    },
    {
      "code": 6010,
      "name": "wrongOwner",
      "msg": "Неверный владелец токен-аккаунта"
    },
    {
      "code": 6011,
      "name": "wrongMint",
      "msg": "Неверный токен"
    },
    {
      "code": 6012,
      "name": "overflow",
      "msg": "Переполнение"
    }
  ],
  "types": [
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pool",
            "type": "pubkey"
          },
          {
            "name": "contributor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "refunded",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "organizer",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "raised",
            "type": "u64"
          },
          {
            "name": "contributorCount",
            "type": "u32"
          },
          {
            "name": "status",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
