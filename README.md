# CareerLens

Психологические тесты для карьеры: профориентация, подходящая IT-профессия, Big Five, выгорание и синдром самозванца.
Без регистрации и сервера: баллы считаются в браузере, прогресс хранится в `localStorage`, а ссылка «Поделиться» содержит ответы в параметре `?a=`.

https://careerlens.denisenkosergey.ru

## Стек

React 19, TypeScript, Vite 7, React Router 7, CSS Modules. Нужен Node 22 (`.nvmrc`).

```bash
npm install
npm run dev
npm run build
```

## Как устроены тесты

Тест — это данные в `src/tests/*.ts` (тип `CareerTest` в `src/tests/types.ts`): шкалы, вопросы с весами по шкалам, уровни и тексты интерпретации.
Каждый ответ нормируется в [0, 1], а балл шкалы считается как доля от максимума (0–100). Отрицательный вес означает обратный пункт (`src/lib/scoring.ts`).

Чтобы добавить тест, создайте файл в `src/tests/` и подключите его в `src/tests/index.ts`.

| Тест | Основа | Статус |
| --- | --- | --- |
| Тест Голланда | Модель RIASEC, вопросы авторские | свободно |
| Какая IT-профессия подходит | Авторский | самодиагностика |
| Big Five в работе | IPIP Big-Five Factor Markers, 50 пунктов | общественное достояние |
| Выгорание | Copenhagen Burnout Inventory, шкалы личного и рабочего выгорания | свободное использование |
| Синдром самозванца | Авторский, по мотивам Клэнс и Аймс | самодиагностика |

## Деплой

1. DNS: A-запись `careerlens` → IP сервера denisenkosergey.ru.
2. Один раз на сервере: скопировать `deploy/nginx/careerlens.conf` в `/etc/nginx/sites-available/`, включить ссылкой в `sites-enabled`, `nginx -t && systemctl reload nginx`, затем `certbot --nginx -d careerlens.denisenkosergey.ru`.
3. Выкладка: `./deploy/deploy.sh`.
