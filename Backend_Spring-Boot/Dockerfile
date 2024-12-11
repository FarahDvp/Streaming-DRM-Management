FROM maven:3.8.3-openjdk-17  as lets-dev
WORKDIR /app
COPY . /app
CMD bash -c "mvn dependency:go-offline -B && mvn clean spring-boot:run"

#Should include Dockerizing ffmpeg and the packager utilized in VideoServiceImpl at lines 178 and 217
#ffmpeg: https://ffmpeg.org/releases/ffmpeg-6.1.1-essentials_build-www.gyan.dev.zip
#packager: https://github.com/shaka-project/shaka-packager/releases/tag/v2.6.1/packager-win-x64.exe









