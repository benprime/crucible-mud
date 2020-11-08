# install nvm
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh -o /tmp/install_nvm.sh
bash /tmp/install_nvm.sh
source ~/.profile

# install node and global npm packages
nvm install 14.15
npm install -g forever
