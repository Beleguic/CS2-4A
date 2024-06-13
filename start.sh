cd /home/node/tropicool
npm install
npm run build
mkdir -p /usr/share/nginx/html
cp -r /home/node/tropicool/dist/* /usr/share/nginx/html/
