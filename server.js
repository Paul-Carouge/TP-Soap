const soap = require("soap");
const fs = require("node:fs");
const http = require("http");

// Définition du service
const service = {
  ProductsService: {
    ProductsPort: {
        CreateProduct: function ({ name, about, price }, callback) {
            if (!name || !about || !price) {
              throw {
                Fault: {
                  Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:BadArguments" },
                  },
                  Reason: { Text: "Processing Error" },
                  statusCode: 400,
                },
              };
            }
            callback({ ...args, id: "myid" });
          },
    },
  },
};



// Serveur http pour le test
const server = http.createServer(function (request, response) {
    response.end("404: Not Found: " + request.url);
  });
  
  server.listen(8000);
  
  // Création du serveur SOAP
  const xml = fs.readFileSync("productsService.wsdl", "utf8");
  soap.listen(server, "/products", service, xml, function () {
    console.log("SOAP server running at http://localhost:8000/products?wsdl");
  });  