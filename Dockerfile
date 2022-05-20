FROM node:alpine

RUN mkdir /opt/app && adduser -s /usr/bin/node -D app && chown -R app:app /opt/app
USER app
COPY ./ /opt/app

WORKDIR /opt/app
RUN yarn install --frozen-lockfile && yarn run build

CMD ["./dist/index.js"]
