import type { AnswerScale } from './types'

export const agreeScale: AnswerScale = {
  options: [
    { label: 'Совсем не про меня' },
    { label: 'Скорее нет' },
    { label: 'Отчасти' },
    { label: 'Скорее да' },
    { label: 'Точно про меня' },
  ],
}

export const likeScale: AnswerScale = {
  options: [
    { label: 'Совсем не нравится' },
    { label: 'Скорее не нравится' },
    { label: 'Всё равно' },
    { label: 'Скорее нравится' },
    { label: 'Очень нравится' },
  ],
}

export const frequencyScale: AnswerScale = {
  options: [
    { label: 'Никогда' },
    { label: 'Редко' },
    { label: 'Иногда' },
    { label: 'Часто' },
    { label: 'Всегда' },
  ],
}
