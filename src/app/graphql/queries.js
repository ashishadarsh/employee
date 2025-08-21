import { ApolloClient, gql, InMemoryCache, ApolloLink, concat, createHttpLink, split } from '@apollo/client/core'
//import { GraphQLClient } from "graphql-request";
import { AuthService } from "../auth.service";

import {GraphQLWsLink} from '@apollo/client/link/subscriptions'
import { createClient as createWsClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { Kind, OperationTypeNode } from 'graphql';

const authService = new AuthService()
// const client = new GraphQLClient('http://localhost:9000/graphql',{
//   headers: () => {
//     const accessToken = authService.getAccessToken();
//     if(accessToken) {
//       return {'Authorization': `Bearer ${accessToken}`};
//     }
//     return {};
//   }
// });



const authLink = new ApolloLink((operation, forward) => {
  const accessToken = authService.getAccessToken();
  if(accessToken) {
    operation.setContext({
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }
  return forward(operation);
})

const httpLink = concat(authLink, createHttpLink({
    uri: 'http://localhost:9000/graphql'
  })
);

const wsLink = new GraphQLWsLink(createWsClient({
  url: 'ws://localhost:9000/graphql',
}))

export const apolloClient = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink),
  cache: new InMemoryCache(),
});

function isSubscription(operation) {
  const definition = getMainDefinition(operation.query)
  return definition.kind === Kind.OPERATION_DEFINITION && definition.operation === OperationTypeNode.SUBSCRIPTION;
}

const employeeDetailsFragment = gql`
  fragment employeeDetails on Employee {
    _id
    firstName
    lastName
    designation
    mobileNo
    dob
    email
    gender
    team
  }
`

export async function getEmployees() {
  const query = gql`
    query getEmployees{
      employees {
        _id
        designation
        firstName
        gender
      }
    }
  `;
  const {data} = await apolloClient.query({query});
  return data.employees;
}

export async function getMessages() {
  const query = gql`
    query getMessages {
      messages{
        _id
        senderEmpId
        senderName
        text
        date
      }
    }

  `;

  const {data} = await apolloClient.query({query});
  return data.messages;
}

export async function getUnicastMessages(senderEmpId, receiverEmpId) {
  const query = gql`
    query getUnicastMessages($senderEmpId: ID!, $receiverEmpId: ID!) {
      UnicastMessages(senderEmpId: $senderEmpId, receiverEmpId: $receiverEmpId) {
        _id
        senderEmpId
        senderName
        text
        date
        receiverEmpId
      }
    }
  `;

  const { data } = await apolloClient.query({
    query,
    variables: { senderEmpId, receiverEmpId },
    fetchPolicy: 'network-only',
  });
  return data.UnicastMessages;
}


export async function getEmployeeTasks(empId) {
  const query = gql`
    query tasksForEmployee($empId: ID!){
      tasksForEmployee(id: $empId) {
        _id
        assignedDate
        completionDate
        empId
        status
        assigneeId
        title
        description
        type
        pinned
        priority
        backlog
      }
    }
  `;
  const {data} = await apolloClient.query({query, variables:{empId}, fetchPolicy: 'network-only'});
  return data.tasksForEmployee;

}

export async function getEmployee(empId) {
  const query = gql`
    query getEmployee($empId: ID!) {
      employee(id: $empId){
        ...employeeDetails
      }
    }
    ${employeeDetailsFragment}
  `;

  const {data} = await apolloClient.query({query, variables:{empId}});
  return data.employee;
}

export async function deleteTask(id) {
  const mutation = gql`
    mutation deleteTask($id: ID!) {
      deleteTask(id: $id) {
        _id
      }
    }
  `;

  const { data } = await apolloClient.mutate({
    mutation,
    variables: { id },
  });
  return data.deleteTask;
}

export async function getEmployeesByTeam(team) {
  const query = gql`
    query getEmployeesByTeam($team: String!) {
      getEmployeesByTeam(team: $team){
        ...employeeDetails
      }
    }
    ${employeeDetailsFragment}
  `;

  //const {getEmployeesByTeam} = await client.request(query, {team});
  const {data} = await apolloClient.query({query, variables: {team}});
  return data.getEmployeesByTeam;
}

export async function createNewTask({_id, title, description, empId, completionDate, status, type, priority, pinned, backlog}) {
  const mutation = gql`
    mutation createTask($input: createTaskInput!) {
      createTaskForEmployee(input: $input) {
        title
        description
        assignedDate
        status
        empId
        type
      }
    }
  `;

  const { data } = await apolloClient.mutate({
    mutation,
    variables: { "input": {
    _id,
    title,
    description,
    empId,
    completionDate,
    status,
    type,
    priority,
    pinned,
    backlog
  } },
  });
  return data.createTaskForEmployee;
}

export async function addMessage(newMsg) {
  const mutation = gql`
    mutation addMessage($text: String!) {
      addMessage(text: $text) {
        _id
        senderEmpId
        senderName
        text
        date
      }
    }
  `;

  const { data } = await apolloClient.mutate({
    mutation,
    variables: { text: newMsg },
  });
  return data.addMessage;
}

export async function addUnicastMessage(text, senderEmpId, receiverEmpId) {
  if(!text || !senderEmpId || !receiverEmpId) {
    throw new Error("Invalid input for addUnicastMessage");
  }
  const mutation = gql`
    mutation addUnicastMessage($input: createUnicastMessageInput!) {
      addUnicastMessage(input: $input) {
        _id
        senderEmpId
        senderName
        text
        date
        receiverEmpId
      }
    }
  `;

  const { data } = await apolloClient.mutate({
    mutation,
    variables: { "input" : {text, senderEmpId, receiverEmpId} },
  });
  return data.addUnicastMessage;
}

export const messgeAddedSubscription = gql`
  subscription messageAddedSubscription {
    message: messageAdded {
      _id
        senderEmpId
        senderName
        text
        date
    }
  }
`
  export const unicastMessageAddedSubscription = gql`
  subscription unicastMessageAddedSubscription {
    unicastMessageAdded: unicastMessageAdded {
        _id
        senderEmpId
        senderName
        text
        date
        receiverEmpId
    }
  }
`;
