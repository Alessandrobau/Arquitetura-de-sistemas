# Gabriel revise o código


## TO-DO

- ajuste das respostas dos erros http
- save order aparecendo o total value errado
- alterar updateProduct method POST -> PUT


## Subir aplicação

- Instalar prisma

```bash
npm install @prisma/client
```

- Migrate

``` bash
npx prisma migrate dev
```

- Reset banco de dados

``` bash
npx prisma migrate reset
```

- Subir banco docker

 ``` bash
sudo docker compose up -d 
```

- start application

``` bash
node app.js start
```
