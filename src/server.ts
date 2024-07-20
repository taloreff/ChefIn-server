import init from "./app";

init().then((app) => {
  
  app.listen(process.env.PORT, () => {
    console.log(
      "Server running at port " + process.env.PORT
    );
  });
});