# Use an official Node.js runtime as the base image
FROM node:14


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install


COPY . .

EXPOSE 3000

# Command to run your application
CMD ["npm", "start"]
