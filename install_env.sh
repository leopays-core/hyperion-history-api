#!/usr/bin/env bash
set -eo pipefail

#terminal colors
COLOR_NC=$(tput sgr0)
export COLOR_NC
COLOR_RED=$(tput setaf 1)
export COLOR_RED
COLOR_GREEN=$(tput setaf 2)
export COLOR_GREEN
COLOR_YELLOW=$(tput setaf 3)
export COLOR_YELLOW
COLOR_BLUE=$(tput setaf 4)
export COLOR_BLUE

#variables
INITIAL_PARAMS="$*"
GLOBAL="y"
RABBIT_USER="hyperion"
RABBIT_PASSWORD="123456"
NODE=false
YARN=false
ELASTIC=false
REDIS=false
RABBIT=false
RAM=0

help_function() {
    echo -e "\nAutomated shell script that installs all dependencies and then configure Hyperion."
    echo -e "\nUsage: ./install.env <option>\n"
    echo -e "Options:"
    echo -e "  --help ==> Show this menu"
    echo -e "  --version ==> Show Hyperion current version\n"
    exit 0
}

version (){
  echo -e "\nv3.0.0\n"
  exit 0

}

arg_checker() {
    if [ "${INITIAL_PARAMS}" == "--help" ]; then
        help_function

    elif [ "${INITIAL_PARAMS}" == "--version" ]; then
        version
    fi
}

check_ram() {
  RAM=$(free --giga | awk '/Mem/ {print $2}')
}

# first check if is installed, after check version
check_dependencies() {
  echo -e "\n\n${COLOR_BLUE}Checking dependencies...${COLOR_NC}\n\n"

  CMD=$(if (dpkg --compare-versions $(dpkg -s nodejs 2>/dev/null | awk '/Version/ {print $2}') ge "5" 2>/dev/null); then echo true; else echo false; fi)
  if ("$CMD" = true); then
    NODE=true
    echo -e "\n\n${COLOR_BLUE}Nodejs compatible version already installed ${COLOR_NC}"
  elif ("$CMD" = false); then
    echo -e "\n\n${COLOR_RED}Nodejs installed version is < 13. Please, update and try again. ${COLOR_NC}\n\n"
    exit 1
  else
    echo -e "\n\n${COLOR_BLUE}Nodejs not installed ${COLOR_NC}"
  fi

  CMD=$(if (dpkg --compare-versions $(dpkg -s yarn 2>/dev/null | awk '/Version/ {print $2}') ge "1.22.0" 2>/dev/null); then echo true; else echo false; fi)
  if ("$CMD" = true); then
    YARN=true
    echo -e "\n\n${COLOR_BLUE}Yarn compatible version already installed ${COLOR_NC}"
  elif ("$CMD" = false); then
    echo -e "\n\n${COLOR_RED}Yarn installed version is < 1.22.0. Please, update and try again. ${COLOR_NC}\n\n"
    exit 1
  else
    echo -e "\n\n${COLOR_BLUE}Yarn not installed ${COLOR_NC}"
  fi

  CMD=$(if (dpkg --compare-versions $(dpkg -s elasticsearch 2>/dev/null | awk '/Version/ {print $2}') ge "7.6" 2>/dev/null); then echo true; else echo false; fi)
  if ("$CMD" = true); then
    ELASTIC=true
    echo -e "\n${COLOR_BLUE}Elasticsearch compatible version already installed ${COLOR_NC}"
  elif ("$CMD" = false); then
    echo -e "\n\n${COLOR_RED}Elasticsearch installed version is < 7.6. Please, update and try again. ${COLOR_NC}\n\n"
    exit 1
  else
    echo -e "\n${COLOR_BLUE}Elasticsearch not installed ${COLOR_NC}"
  fi

  CMD=$(if (dpkg --compare-versions $(dpkg -s redis-server 2>/dev/null | awk '/Version/ {print $2}') ge "5" 2>/dev/null); then echo true; else echo false; fi)
  if ("$CMD" = true); then
    REDIS=true
    echo -e "\n${COLOR_BLUE}Redis compatible version already installed ${COLOR_NC}"
  elif ("$CMD" = false); then
    echo -e "\n\n${COLOR_RED}Redis installed version is < 5. Please, update and try again. ${COLOR_NC}\n\n"
    exit 1
  else
    echo -e "\n${COLOR_BLUE}Redis not installed ${COLOR_NC}"
  fi

  CMD=$(if (dpkg --compare-versions $(dpkg -s rabbitmq-server 2>/dev/null | awk '/Version/ {print $2}') ge "3.8" 2>/dev/null); then echo true; else echo false; fi)
  if ("$CMD" = true); then
    RABBIT=true
    echo -e "\n${COLOR_BLUE}RabbitMQ compatible version already installed ${COLOR_NC}"
  elif ("$CMD" = false); then
    echo -e "\n\n${COLOR_RED}RabbitMQ installed version is < 3.8. Please, update and try again. ${COLOR_NC}\n\n"
    exit 1
  else
    echo -e "\n${COLOR_BLUE}RabbitMQ not installed ${COLOR_NC}"
  fi

  CMD=$(if (dpkg --compare-versions $(dpkg -s kibana 2>/dev/null | awk '/Version/ {print $2}') ge "7.6" 2>/dev/null); then echo true; else echo false; fi)
  if ("$CMD" = true); then
    RABBIT=true
    echo -e "\n${COLOR_BLUE}Kibana compatible version already installed ${COLOR_NC}"
  elif ("$CMD" = false); then
    echo -e "\n\n${COLOR_RED}Kibana installed version is < 7.6. Please, update and try again. ${COLOR_NC}\n\n"
    exit 1
  else
    echo -e "\n${COLOR_BLUE}Kibana not installed ${COLOR_NC}\n\n"
  fi
}

# Make a directory for global installations
configure_yarn() {
  mkdir ~/.yarn
  yarn config set prefix "$HOME/.yarn"
  # export path for the current session
  export PATH=$HOME/.yarn/bin:$PATH
  # make PATH persistent
  echo "export PATH=~/.yarn/bin:$PATH" >>"$HOME/.profile"
  # shellcheck source=/dev/null
  source ~/.profile
}

install_keys_sources() {
  echo -e "\n\n${COLOR_BLUE}Configuring keys and sources...${COLOR_NC}\n\n"

  PPA="https://artifacts.elastic.co/packages/7.x/apt stable main"
  if ! grep -q "^deb .*$PPA" /etc/apt/sources.list /etc/apt/sources.list.d/*; then
    wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
    echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list
  fi

  PPA="http://dl.bintray.com/rabbitmq-erlang/debian bionic erlang"
  if ! grep -q "^deb .*$PPA" /etc/apt/sources.list /etc/apt/sources.list.d/*; then
    curl -fsSL https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc | sudo apt-key add -
    echo "deb http://dl.bintray.com/rabbitmq-erlang/debian bionic erlang" | sudo tee /etc/apt/sources.list.d/bintray.rabbitmq.list
    curl -s https://packagecloud.io/install/repositories/rabbitmq/rabbitmq-server/script.deb.sh | sudo bash
  fi

  PPA="https://deb.nodesource.com/node_13.x bionic main"
  if ! grep -q "^deb .*$PPA" /etc/apt/sources.list /etc/apt/sources.list.d/*; then
    curl -sL "https://deb.nodesource.com/setup_13.x" | sudo -E bash -
  fi

  PPA="https://dl.yarnpkg.com/debian/ stable main"
  if ! grep -q "^deb .*$PPA" /etc/apt/sources.list /etc/apt/sources.list.d/*; then
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  fi

  sudo apt update -y
}

install_dep() {
 echo -e "\n\n${COLOR_BLUE}Installing dependencies...${COLOR_NC}\n\n"
 # sudo apt install -y build-essential curl
 sudo apt install -y curl
}

install_node() {
  echo -e "\n\n${COLOR_BLUE}Installing nodejs...${COLOR_NC}\n\n"
  sudo apt install -y nodejs
}

install_yarn() {
  echo -e "\n\n${COLOR_BLUE}Installing yarn...${COLOR_NC}\n\n"
  sudo apt install -y yarn
  read -p "Do you want to create a directory for yarn global installations [Y/n] : " GLOBAL
  GLOBAL=${GLOBAL:-y}
  if [ "$GLOBAL" = "y" ]; then
    configure_yarn
  fi
}

install_build_hyperion() {
  echo -e "\n\n${COLOR_BLUE}Installing packages and building hyperion...${COLOR_NC}\n\n"
  yarn install
}

install_pm2() {
  echo -e "\n\n${COLOR_BLUE}Installing pm2...${COLOR_NC}\n\n"
  if [ "$GLOBAL" = "y" ]; then
    yarn global add pm2@latest
  else
    sudo yarn global add pm2@latest
  fi
}

install_redis() {
  echo -e "\n\n${COLOR_BLUE}Installing redis...${COLOR_NC}\n\n"
  sudo apt install -y redis-server
  sudo sed -ie 's/supervised no/supervised systemd/' /etc/redis/redis.conf
  sudo systemctl restart redis.service
}

install_erlang() {
  echo -e "\n\n${COLOR_BLUE}Installing erlang...${COLOR_NC}\n\n"
  sudo apt -y install erlang
}

#ask user for rabbit credentials
rabbit_credentials() {
  read -p "Enter rabbitmq user [hyperion]: " RABBIT_USER
  RABBIT_USER=${RABBIT_USER:-hyperion}

  read -p "Enter rabbitmq password [123456]: " RABBIT_PASSWORD
  RABBIT_PASSWORD=${RABBIT_PASSWORD:-123456}

}

install_rabittmq() {
  echo -e "\n\n${COLOR_BLUE}Installing rabbit-mq...${COLOR_NC}\n\n"
  sudo apt install -y rabbitmq-server
  #enable web gui
  sudo rabbitmq-plugins enable rabbitmq_management
  sudo rabbitmqctl add_vhost /hyperion
  sudo rabbitmqctl add_user ${RABBIT_USER} ${RABBIT_PASSWORD}
  sudo rabbitmqctl set_user_tags ${RABBIT_USER} administrator
  sudo rabbitmqctl set_permissions -p /hyperion ${RABBIT_USER} ".*" ".*" ".*"
}

install_elastic() {
  echo -e "\n\n${COLOR_BLUE}Installing elastic...${COLOR_NC}\n\n"
  sudo apt install -y elasticsearch

  echo -e "\n\n${COLOR_BLUE}Configuring elastic...${COLOR_NC}\n\n"

  # edit configs
  sudo sed -ie 's/#cluster.name: my-application/cluster.name: myCluster/; s/#bootstrap.memory_lock: true/bootstrap.memory_lock: true/' /etc/elasticsearch/elasticsearch.yml
  # set jvm options based on system RAM
  check_ram
  if [ "$RAM" -lt 32 ]; then
    (( RAM=RAM/2 ))
    sudo sed -ie 's/-Xms1g/-Xms'"$RAM"'g/; s/-Xmx1g/-Xmx'"$RAM"'g/' /etc/elasticsearch/jvm.options
  else
    sudo sed -ie 's/-Xms1g/-Xms16g/; s/-Xmx1g/-Xmx16g/' /etc/elasticsearch/jvm.options
  fi

  sudo bash -c 'echo "xpack.security.enabled: true" >> /etc/elasticsearch/elasticsearch.yml'

  sudo mkdir -p /etc/systemd/system/elasticsearch.service.d/
  echo -e "[Service]\nLimitMEMLOCK=infinity" | sudo tee /etc/systemd/system/elasticsearch.service.d/override.conf
  sudo systemctl daemon-reload
  sudo service elasticsearch start
  sudo systemctl enable elasticsearch

  echo -e "\n\n${COLOR_BLUE}Generating Elasticsearch cluster passwords...${COLOR_NC}\n\n"

  echo "y" | sudo /usr/share/elasticsearch/bin/elasticsearch-setup-passwords auto >elastic_pass.txt

}

install_kibana() {
  echo -e "\n\n${COLOR_BLUE}Installing and configuring Kibana...${COLOR_NC}\n\n"
  sudo apt install -y kibana

  KIBANA_PASSWORD=$(awk <elastic_pass.txt '/PASSWORD kibana =/ {print $4}')

  sudo sed -ie 's/#elasticsearch.password: "pass"/elasticsearch.password: '"$KIBANA_PASSWORD"'/; s/#elasticsearch.username: "kibana"/elasticsearch.username: "kibana"/' /etc/kibana/kibana.yml

  sudo systemctl enable kibana
  sudo systemctl start kibana
}

#******************
# End of functions
#******************
arg_checker

echo -e "\n\n${COLOR_BLUE}*** STARTING HYPERION HISTORY API CONFIGURATION ***${COLOR_NC}\n\n"

check_dependencies

if [ "$RABBIT" = false ]; then
  rabbit_credentials
fi

install_dep

install_keys_sources
if [ "$NODE" = false ]; then
  install_node
fi

if [ "$YARN" = false ]; then
  install_yarn
fi

install_pm2

install_build_hyperion

if [ "$RABBIT" = false ]; then
  install_rabittmq
fi

if [ "$REDIS" = false ]; then
  install_redis
fi

if [ "$ELASTIC" = false ]; then
  install_elastic
  install_kibana
fi

printf "
 _   ___   ______  _____ ____  ___ ___  _   _
| | | \ \ / /  _ \| ____|  _ \|_ _/ _ \| \ | |
| |_| |\ V /| |_) |  _| | |_) || | | | |  \| |
|  _  | | | |  __/| |___|  _ < | | |_| | |\  |
|_| |_| |_| |_|   |_____|_| \_\___\___/|_| \_|
Made with ♥ by EOS Rio
"
echo -e "\n\n${COLOR_GREEN}Hyperion History API successfully installed!!${COLOR_NC}"
echo -e "\n${COLOR_YELLOW}Please, check your installation: ${COLOR_NC}"
echo -e "${COLOR_YELLOW}- Elastic: http://localhost:9200 ${COLOR_NC}"
echo -e "${COLOR_YELLOW}- Kibana: http://localhost:5601 ${COLOR_NC}"
echo -e "${COLOR_YELLOW}- RabbitMQ: http://localhost:15672 ${COLOR_NC}"
echo -e "${COLOR_YELLOW}- Refer to the elastic_pas.txt file for the elasticsearch passwords. ${COLOR_NC}"
echo -e "${COLOR_YELLOW}- Make pm2 auto-boot at server restart: \$ pm2 startup ${COLOR_NC}\n"
