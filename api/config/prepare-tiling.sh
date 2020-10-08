#!/bin/bash

ROOT=/imageroot
PROJECT=wes
PROJECT_ROOT=$ROOT/$PROJECT

# to be called from /imageroot/wes

for FILE in sources/*
do
  IMAGE_ID=${FILE/sources\//}
  mkdir -p $PROJECT_ROOT/$IMAGE_ID

  WIDTH=`identify -format %[fx:w] $FILE`
  # HEIGHT=`identify -format \"%[fx:h]\" $FILE`
  # TODO FIGURE out max
  SIZE=$WIDTH

  # TODO see that aspect ratio is maintained
  while [ $SIZE -gt 256 ]; do
    echo $SIZE
    convert sources/$IMAGE_ID -resize ${SIZE}x${SIZE} ${PROJECT_ROOT}/${IMAGE_ID}/$IMAGE_ID.${SIZE}.jpg
    SIZE=`expr $SIZE / 2`
  done
done