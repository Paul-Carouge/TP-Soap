const soap = require("soap");

soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
  if (err) {
    console.error("Error creating SOAP client:", err);
    return;
  }
  // Faire une requête SOAP
  client.CreateProduct({ name: "Roblox", price: 12, about: "Le jeu est un jeu Roblox" }, function (err, result) {
    if (err) {
      console.error(
        "Error making SOAP request:",
        err.response.status,
        err.response.statusText,
        err.body
      );
      return;
    }
    console.log("ResultAjout:", result);
  });

  client.GetProducts({}, function (err, result) {
    if (err) {
      console.error("Error making SOAP request:", err);
      return;
    }
    console.log("ResultRecup:", result);
  });
});
