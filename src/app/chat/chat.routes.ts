import { Routes } from "@angular/router";
import { ChatAllComponent } from "./chat-all/chat-all.component";
import { resolveUserName } from "../app.component";
import { ChatItemComponent } from "./chat-item/chat-item.component";

export const routes: Routes =
[
  {path: '', redirectTo: 'chat-all', pathMatch: 'full' },
  { path: 'chat-all', component: ChatAllComponent, title: 'Team Chat' },
  { path: ':id/:name', component: ChatItemComponent, title: resolveUserName  },
]
