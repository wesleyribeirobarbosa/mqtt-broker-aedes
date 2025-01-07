# Dockerfile
FROM node:16-alpine

# Definindo o diretório de trabalho
WORKDIR /app

# Copiando o package.json e instalando dependências
COPY package.json ./
RUN npm install

# Copiando o restante dos arquivos da aplicação para o container
COPY app/ .

# Expondo a porta padrão do MQTT (1883)
EXPOSE 1883

# Comando para rodar o broker
CMD ["node", "broker.js"]
