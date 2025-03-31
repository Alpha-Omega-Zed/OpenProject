#!/bin/bash

sudo docker compose down backend frontend
sudo docker compose run --rm backend setup
sudo docker compose run --rm frontend npm install
sudo docker compose up -d frontend