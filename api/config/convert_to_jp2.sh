#!/bin/bash

if [ -z "$1" ]
then
  for FOLDER in /imageroot/*
  do
    echo $FOLDER
    cd $FOLDER
    for FILE in $FOLDER/*
    do
      convert $FILE $FILE.jp2
    done
  done
else
  for FILE in /imageroot/$1/*
  do
    convert $FILE $FILE.jp2
  done
fi