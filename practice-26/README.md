# Practice 26 — GraphQL + Apollo Server

Минимальный GraphQL API для каталога книг.

## Запуск

```bash
npm install
npm start
```

Apollo Sandbox откроется по адресу http://localhost:4000

## Примеры запросов для защиты

### 1. Все книги с авторами (вложенный резолвер `Book.author`)
```graphql
query {
  books {
    id
    title
    year
    author {
      name
    }
  }
}
```

### 2. Один автор со всеми его книгами (вложенный резолвер `Author.books`)
```graphql
query {
  authors {
    id
    name
    books {
      title
      year
    }
  }
}
```

### 3. Книга по id
```graphql
query {
  book(id: "1") {
    title
    year
    author { name }
  }
}
```

### 4. Создание автора (мутация)
```graphql
mutation {
  createAuthor(name: "Антон Чехов") {
    id
    name
  }
}
```

### 5. Создание книги (мутация)
```graphql
mutation {
  createBook(title: "Вишнёвый сад", year: 1904, authorId: "3") {
    id
    title
    author { name }
  }
}
```
