import React, { useContext } from "react";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SellerProductContext from "@/context/SellerProductContext";
import { addProduct, deleteProduct, editProduct } from "@/services/productApi";

function ProductTable() {
  const { products, loading, error, refreshProducts } =
    useContext(SellerProductContext);

  // Calculate total value of inventory
  const totalValue = products.reduce((sum, product) => {
    return sum + product.price * product.stock;
  }, 0);

  // Determine product status based on stock
  const getProductStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return "Low Stock";
    return "In Stock";
  };

  // Format price with currency

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error: {error}
      </div>
    );
  }

  const handleEditProduct = async (e, productId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: Math.round(parseFloat(formData.get("price")) * 100),
      stock: parseInt(formData.get("stock")),
      images: formData.get("image"),
    };

    try {
      console.log(productData);

      await editProduct(productId, productData);
      refreshProducts();
      // Close the dialog or show success message
    } catch (error) {
      console.error("Error editing product:", error);
      // Show error message to user
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      refreshProducts();
      // Close the dialog or show success message
    } catch (error) {
      console.error("Error deleting product:", error);
      // Show error message to user
    }
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="min-w-[800px] lg:min-w-full">
        <TableCaption>Your current product inventory</TableCaption>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="w-[50px]">ID</TableHead>
            <TableHead className="min-w-[200px]">Product</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px] hidden sm:table-cell">
              Stock
            </TableHead>
            <TableHead className="w-[100px] text-right">Price</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const status = getProductStatus(product.stock);
            return (
              <TableRow
                key={product._id}
                className={product.stock === 0 ? "bg-red-50" : ""}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500 md:hidden">
                    Stock: {product.stock}
                  </div>
                  <div className="text-sm text-gray-500 md:hidden">
                    {product.price}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      status === "In Stock"
                        ? "default"
                        : status === "Low Stock"
                        ? "secondary"
                        : "destructive"
                    }
                    className="whitespace-nowrap"
                  >
                    {status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {product.stock}
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  ₹{product.price}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex-1 sm:flex-none">Edit</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle className="flex justify-center items-center">
                          Edit Product
                        </DialogTitle>
                        <DialogDescription>
                          <form
                            className="grid gap-4 py-4"
                            onSubmit={(e) => handleEditProduct(e, product._id)}
                          >
                            {/* Product Name */}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="name" className="text-right">
                                Name<span className="text-red-500">*</span>
                              </label>
                              <input
                                id="name"
                                name="name" // Add this
                                defaultValue={product.name}
                                required
                                className="col-span-3 border rounded p-2"
                                placeholder="Enter product name"
                              />
                            </div>

                            {/* Product Description */}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label
                                htmlFor="description"
                                className="text-right"
                              >
                                Description
                                <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                id="description"
                                name="description" // Add this
                                defaultValue={product.description}
                                required
                                rows={3}
                                className="col-span-3 border rounded p-2"
                                placeholder="Enter product description"
                              />
                            </div>

                            {/* Price */}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="price" className="text-right">
                                Price<span className="text-red-500">*</span>
                              </label>
                              <div className="col-span-3 flex items-center">
                                <span className="mr-2">₹</span>
                                <input
                                  id="price"
                                  name="price" // Add this
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  defaultValue={product.price / 100}
                                  required
                                  className="border rounded p-2 flex-1"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            {/* Stock */}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="stock" className="text-right">
                                Stock<span className="text-red-500">*</span>
                              </label>
                              <input
                                id="stock"
                                name="stock" // Add this
                                type="number"
                                min="0"
                                defaultValue={product.stock}
                                required
                                className="col-span-3 border rounded p-2"
                                placeholder="Enter available quantity"
                              />
                            </div>

                            {/* Image Upload */}
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="image" className="text-right">
                                Image URL<span className="text-red-500">*</span>
                              </label>
                              <input
                                id="image"
                                name="image" // Add this
                                defaultValue={product.images}
                                required
                                className="col-span-3 border rounded p-2"
                                placeholder="Enter image URL"
                              />
                            </div>

                            <div className="flex justify-center gap-2 pt-4">
                              <Button type="submit">Update Product</Button>
                            </div>
                          </form>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="hidden sm:inline-flex"
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                          <div className="py-4">
                            Are you sure you want to delete "{product.name}"?
                            This action cannot be undone.
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="sm:hidden">
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Product Details</DialogTitle>
                        <DialogDescription>
                          <div className="grid gap-4 py-4">
                            <div className="flex justify-center">
                              <img
                                src={product.images}
                                alt={product.name}
                                className="h-48 object-contain"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">
                                Product Information
                              </h4>
                              <div className="space-y-2">
                                <p>
                                  <span className="text-gray-500">Name:</span>{" "}
                                  {product.name}
                                </p>
                                <p>
                                  <span className="text-gray-500">Status:</span>{" "}
                                  <Badge
                                    variant={
                                      status === "In Stock"
                                        ? "default"
                                        : status === "Low Stock"
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {status}
                                  </Badge>
                                </p>
                                <p>
                                  <span className="text-gray-500">Stock:</span>{" "}
                                  {product.stock}
                                </p>
                                <p>
                                  <span className="text-gray-500">Price:</span>{" "}
                                  ₹{product.price}
                                </p>
                                <p>
                                  <span className="text-gray-500">
                                    Description:
                                  </span>{" "}
                                  {product.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              Edit
                            </Button>
                            <Button variant="destructive" className="flex-1">
                              Delete
                            </Button>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter className="bg-gray-100 min-w-max">
          <TableRow>
            <TableCell colSpan={3}>Total Inventory Value</TableCell>
            <TableCell colSpan={1} className="text-right">
              {totalValue}
            </TableCell>
            <TableCell className="text-right">
              {products.length} items
            </TableCell>
             <TableCell className="text-right">
              
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

const SellerProducts = () => {
  const { refreshProducts } = useContext(SellerProductContext);
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: Math.round(parseFloat(formData.get("price")) * 100),
      stock: parseInt(formData.get("stock")),
      images: formData.get("image"),
    };

    try {
      await addProduct(productData);
      refreshProducts();
      // Close the dialog or show success message
    } catch (error) {
      console.error("Error adding product:", error);
      // Show error message to user
    }
  };
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar className="w-full md:w-64" />
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Your Products</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none">Add Product</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    <form
                      className="grid gap-4 py-4 "
                      onSubmit={handleAddProduct}
                    >
                      {/* Product Name */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right">
                          Name<span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          required
                          className="col-span-3 border rounded p-2"
                          placeholder="Enter product name"
                        />
                      </div>

                      {/* Product Description */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="description" className="text-right">
                          Description<span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          required
                          rows={3}
                          className="col-span-3 border rounded p-2"
                          placeholder="Enter product description"
                        />
                      </div>

                      {/* Categories */}

                      {/* Price */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="price" className="text-right">
                          Price<span className="text-red-500">*</span>
                        </label>
                        <div className="col-span-3 flex items-center">
                          <span className="mr-2">₹</span>
                          <input
                            id="price"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            className="border rounded p-2 flex-1"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="stock" className="text-right">
                          Stock<span className="text-red-500">*</span>
                        </label>
                        <input
                          id="stock"
                          name="stock"
                          type="number"
                          min="0"
                          required
                          className="col-span-3 border rounded p-2"
                          placeholder="Enter available quantity"
                        />
                      </div>

                      {/* Image Upload */}
                      <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="image" className="text-right">
                          Image URL<span className="text-red-500">*</span>
                        </label>
                        <input
                          id="image"
                          name="image"
                          required
                          className="col-span-3 border rounded p-2"
                          placeholder="Enter image URL"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="submit">Add Product</Button>
                      </div>
                    </form>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <ProductTable />
      </div>
    </div>
  );
};
export default SellerProducts;
