FROM node:slim

COPY ./ /usr/local/NICEBackendServer

WORKDIR /usr/local/NICEBackendServer

RUN npm install -g mysql2 nodemon

RUN npm install

RUN chmod 755 -R /usr/local/NICEBackendServer

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/npm","run","eb"]

