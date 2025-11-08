import {
  Globe,
  Home,
  LogOut,
  Menu,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import React, { useContext, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "@/context/CartContext";
import { cn } from "@/lib/utils";
const Navbar = () => {
  const token = localStorage.getItem("token");
  const user = token ? true : false;
  const cart = useContext(CartContext);
  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Products", path: "/products", icon: ShoppingCart },
  ];
  const navigate = useNavigate();
  return (
    <div className="h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 top-0 left-0 right-0 duration-300 z-10">
      <div className=" mx-auto max-w-7xl hidden md:flex justify-between items-center gap-10 h-full">
        <div className="flex items-center  gap-2">
          <Globe size={"30"} />
          <Link to={"/"}>
            <h1 className="hidden md:block font-extrabold text-2xl">
              ShopSphere
            </h1>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks?.map((link) => (
            <Link
              key={link?.path}
              to={link?.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative group",
                location?.pathname === link?.path
                  ? "text-primary"
                  : "text-gray-600 dark:text-gray-300"
              )}
            >
              {link.name}
              <span
                className={cn(
                  "absolute left-0 top-full mt-1 w-0 h-0.5 bg-primary rounded-full transition-all duration-300",
                  location?.pathname === link?.path
                    ? "w-full"
                    : "group-hover:w-full"
                )}
              />
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-8">
          <Link
            to="/cart"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          >
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.cartItems.length}
            </span>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link to={"/orders"}>Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span
                      onClick={() => {
                        localStorage.removeItem("token");
                        navigate;
                      }}
                    >
                      Log out
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant={"outline"}>
                <Link to={"/signin"}>Login</Link>
              </Button>
              <Button>
                {" "}
                <Link to={"/signin"}>Signup</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="flex md:hidden items-center justify-between px-4 h-full">
        <h1 className="font-extrabold text-2xl">Shosphere</h1>
        <MobileNavbar />
      </div>
    </div>
  );
};
const MobileNavbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Products", path: "/products", icon: ShoppingCart },
    { name: "Cart", path: "/cart", icon: ShoppingBag },
  ];

  const authLinks = localStorage.getItem("token")
    ? [
        { name: "Orders", path: "/orders", icon: ShoppingBag },
        {
          name: "Logout",
          action: () => {
            localStorage.removeItem("token");
          },
          icon: LogOut,
        },
      ]
    : [
        { name: "Login", path: "/signin", icon: User },
        { name: "Sign Up", path: "/signup", icon: User },
      ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-transform hover:scale-110"
        >
          <Menu size={24} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <SheetHeader>
          <SheetTitle className="text-left flex items-center gap-2">
            <Globe size={24} className="text-primary" />
            ShopSphere
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full py-6">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start transition-colors",
                  location.pathname === link.path
                    ? "bg-gray-100 dark:bg-gray-800"
                    : ""
                )}
                onClick={() => {
                  navigate(link.path);
                  setOpen(false);
                }}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.name}
              </Button>
            ))}
          </div>

          <div className="mt-auto space-y-2">
            <div className="h-[1px] bg-gray-200 dark:bg-gray-800 my-4" />
            {authLinks.map((link) => (
              <Button
                key={link.name}
                variant="ghost"
                className="w-full justify-start transition-colors"
                onClick={() => {
                  link.path ? navigate(link.path) : link.action();
                  setOpen(false);
                }}
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.name}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default Navbar;
