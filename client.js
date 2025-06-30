const soap = require("soap");

soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
  if (err) {
    console.error("Error creating SOAP client:", err);
    return;
  }

  // Test de création d'un produit
  client.CreateProduct({ name: "Roblox", price: 12, about: "Le jeu est un jeu Roblox" }, function (err, result) {
    if (err) {
      console.error("Error creating product:", err);
      return;
    }
    console.log("Produit créé:", result);

    // Test de mise à jour du produit
    client.PatchProduct({ 
      id: result.id,
      price: 15,
      about: "Le jeu est un jeu Roblox mis à jour"
    }, function (err, result) {
      if (err) {
        console.error("Error updating product:", err);
        return;
      }
      console.log("Produit mis à jour:", result);

      // Test de suppression du produit
      client.DeleteProduct({ id: result.id }, function (err, result) {
        if (err) {
          console.error("Error deleting product:", err);
          return;
        }
        console.log("Produit supprimé:", result);

        // Récupération de tous les produits pour vérifier
        client.GetProducts({}, function (err, result) {
          if (err) {
            console.error("Error getting products:", err);
            return;
          }
          console.log("Liste des produits après modifications:", result);
        });
      });
    });
  });
});
