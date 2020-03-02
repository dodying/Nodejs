@echo off && title Update anime-titles.dat.gz
if exist anime-titles.dat.gz del anime-titles.dat.gz
wget http://anidb.net/api/anime-titles.dat.gz --connect-timeout=30 --tries=3
if not exist anime-titles.dat.gz goto eol
7z e anime-titles.dat.gz -y
del anime-titles.dat.gz

:eol