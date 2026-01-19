import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AppLogo } from "../../logo/logo";

@Component({
  selector: "app-auth-layout",
  imports: [AppLogo, RouterOutlet],
  templateUrl: "./auth-layout.html",
})
export class AuthLayout {}
