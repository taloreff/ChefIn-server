import init from "./app";

init().then(({ httpsServer, httpServer }) => {
  // Start HTTP server
  httpServer.listen(process.env.HTTP_PORT, () => {
    console.log(
      "HTTP Server running at port " + process.env.HTTP_PORT
    );
  });

  // Start HTTPS server
  httpsServer.listen(process.env.HTTPS_PORT, () => {
    console.log(
      "HTTPS Server running at port " + process.env.HTTPS_PORT
    );
  });
});
