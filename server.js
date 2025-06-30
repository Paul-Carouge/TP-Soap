const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");
 
const sql = postgres({ db: "mydb", user: "paul", password: "1805" });

// Définition du service
const service = {
  ProductsService: {
    ProductsPort: {
        // Création d'un produit
        CreateProduct: async function ({ name, about, price }, callback) {
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
    
            const product = await sql`
              INSERT INTO products (name, about, price)
              VALUES (${name}, ${about}, ${price})
              RETURNING *
              `;
        
            // Retourne le produit créé
            callback(product[0]);
        },

        // Récupération de tous les produits
        GetProducts: async function (_, callback) {
            const products = await sql`
                SELECT * FROM products
            `;
            callback(products);
        },

        // Mise à jour partielle d'un produit
        PatchProduct: async function ({ id, name, about, price }, callback) {
            if (!id) {
                throw {
                    Fault: {
                        Code: {
                            Value: "soap:Sender",
                            Subcode: { value: "rpc:BadArguments" },
                        },
                        Reason: { Text: "ID is required" },
                        statusCode: 400,
                    },
                };
            }

            // Vérifier si le produit existe
            const existingProduct = await sql`
                SELECT * FROM products WHERE id = ${id}
            `;

            if (existingProduct.length === 0) {
                throw {
                    Fault: {
                        Code: {
                            Value: "soap:Sender",
                            Subcode: { value: "rpc:NotFound" },
                        },
                        Reason: { Text: "Product not found" },
                        statusCode: 404,
                    },
                };
            }

            // Préparer les valeurs à mettre à jour
            const updatedName = name !== undefined ? name : existingProduct[0].name;
            const updatedAbout = about !== undefined ? about : existingProduct[0].about;
            const updatedPrice = price !== undefined ? price : existingProduct[0].price;

            // Effectuer la mise à jour
            const updatedProduct = await sql`
                UPDATE products 
                SET name = ${updatedName},
                    about = ${updatedAbout},
                    price = ${updatedPrice}
                WHERE id = ${id}
                RETURNING *
            `;

            callback(updatedProduct[0]);
        },

        // Suppression d'un produit
        DeleteProduct: async function ({ id }, callback) {
            if (!id) {
                throw {
                    Fault: {
                        Code: {
                            Value: "soap:Sender",
                            Subcode: { value: "rpc:BadArguments" },
                        },
                        Reason: { Text: "ID is required" },
                        statusCode: 400,
                    },
                };
            }

            // Vérifier si le produit existe
            const existingProduct = await sql`
                SELECT * FROM products WHERE id = ${id}
            `;

            if (existingProduct.length === 0) {
                throw {
                    Fault: {
                        Code: {
                            Value: "soap:Sender",
                            Subcode: { value: "rpc:NotFound" },
                        },
                        Reason: { Text: "Product not found" },
                        statusCode: 404,
                    },
                };
            }

            // Supprimer le produit
            await sql`
                DELETE FROM products WHERE id = ${id}
            `;

            callback({
                success: true,
                message: "Product successfully deleted"
            });
        }
    }
  }
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

  