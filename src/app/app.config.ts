import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApolloClient} from '@apollo/client/core';
import {apolloClient } from '../app/graphql/queries'

// import { AuthService } from './auth.service';
// import {GraphQLWsLink} from '@apollo/client/link/subscriptions'
// import { createClient as createWsClient } from 'graphql-ws';
// import { getMainDefinition } from '@apollo/client/utilities';
// import { Kind, OperationTypeNode } from 'graphql';

// const authService = new AuthService()

// const authLink = new ApolloLink((operation, forward) => {
//   const accessToken = authService.getAccessToken();
//   if(accessToken) {
//     operation.setContext({
//       headers: {
//         'Authorization': `Bearer ${accessToken}`
//       }
//     })
//   }
//   return forward(operation);
// })

// const httpLink = concat(authLink, createHttpLink({
//     uri: 'http://localhost:9000/graphql'
//   })
// );

// const wsLink = new GraphQLWsLink(createWsClient({
//   url: 'ws://localhost:9000/graphql',
// }))

// const apolloClient = new ApolloClient({
//   link: split(isSubscription, wsLink, httpLink),
//   cache: new InMemoryCache(),
// });

// function isSubscription(operation) {
//   const definition = getMainDefinition(operation.query)
//   return definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.SUBSCRIPTION;
// }

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes, withComponentInputBinding()), provideAnimationsAsync(),{
    provide: ApolloClient,
    useValue: apolloClient,
  },]
};
