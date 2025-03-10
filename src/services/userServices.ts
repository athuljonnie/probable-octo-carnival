//userServices.ts
import { growApi, vocalLabApi, webHookUrl } from './api';

// Function to request OTP
export const requestOtp = async (phoneNumber: string) => {
    console.log(phoneNumber)
  try {
    const response = await growApi.post('', {
      query: `
        mutation ($phone: String!) {
          registerWithoutPassword(credentials: {phone: $phone}) {
            request_id
            status
          }
        }
      `,
      variables: { phone: phoneNumber },
    });
console.log(response)
    return response.data.data.registerWithoutPassword;
  } catch (error) {
    throw new Error('Failed to send OTP. Please try again.');
  }
};

// Function to verify OTP
export const verifyOtp = async (phone: string, otp: string) => {
  try {
    const response = await growApi.post('', {
      query: `
        mutation ($phone: String!, $otp: String!) {
                    verifyOTP(request: { otp: $otp, phone: $phone }) {
                           auth_token  
                           id
                          status
                      }
                  }
                `,
       variables: { phone, otp },
    });
    return response.data.data.verifyOTP;
  } catch (error) {
    throw new Error('Failed to verify OTP. Please try again.');
    console.error(error)
  }
};


export const getBalance = async (user_id: string) => {
  try {    
    const response = await growApi.post('', {
      query: `query GetBalance($user_id: uuid!) {  
  whatsub_user_wallet_locked_unlocked_internal(
    where: { user_id: { _eq: $user_id } }
  ) {
    unlocked_amount  
  }
}`,
      variables: { user_id },
    });

    const balance =
      response.data?.data?.whatsub_user_wallet_locked_unlocked_internal?.[0]
        ?.unlocked_amount;
    return balance;
  } catch (error) {
    throw new Error('Error Fetching Balance.');
  }
};


export const getAgentsElseCreateOne = async (client_id: string) => {
  try {
    const response = await vocalLabApi.post('', {
    query:`query MyQuery($client_id: uuid!) {
  vocallabs_agent(where: {client_id: {_eq: $client_id}, active: {_eq: true}}, order_by: {created_at: desc}) {
    id
    language
    name
    welcome_message
    agent_prompt
  }
}
`,
      variables: { client_id },
    });
    console.log(response)
    return response.data.data.vocallabs_agent;
  } catch (error) {
    console.error('Error fetching agent configuration:', error);
    throw new Error('Failed to fetch agent configuration.');
  }
};



export const updateAgent = async (client_id: string, agent_busy: string, agent_unavailable: string, agent_switched_off: string) => {
  try {
    const response = await vocalLabApi.post('', {
      query: `
        mutation MyQuery($client_id: uuid!, $agent_busy: uuid!, $agent_unavailable: uuid!, $agent_switched_off: uuid!) {
          update_vocallabs_call_forwarding_agents_by_pk(
            pk_columns: {client_id: $client_id},
            _set: {agent_busy: $agent_busy, agent_switched_off: $agent_switched_off, agent_unavailable: $agent_unavailable}
          ) {
            agent_busy
            agent_switched_off
            agent_unavailable
            client_id
          }
        }
      `,
      variables: { client_id, agent_busy, agent_unavailable, agent_switched_off },
    });

    return response.data.data.update_vocallabs_call_forwarding_agents_by_pk;
  } catch (error) {
    console.error('Error updating agent configuration:', error);
    throw new Error('Failed to update agent configuration.');
  }
};



export const insertAgent = async (client_id: string, agent_busy: string, agent_unavailable: string, agent_switched_off: string) => {
  try {
    const response = await vocalLabApi.post('', {
      query: `
        mutation MyQuery($client_id: uuid!, $agent_busy: uuid!, $agent_unavailable: uuid!, $agent_switched_off: uuid!) {
          insert_vocallabs_call_forwarding_agents_one(
            object: {agent_busy: $agent_busy, agent_switched_off: $agent_switched_off, agent_unavailable: $agent_unavailable, client_id: $client_id}
          ) {
            agent_busy
            agent_switched_off
            agent_unavailable
            client_id
          }
        }
      `,
      variables: { client_id, agent_busy, agent_unavailable, agent_switched_off },
    });

    return response.data.data.insert_vocallabs_call_forwarding_agents_one;
  } catch (error) {
    console.error('Error inserting agent configuration:', error);
    throw new Error('Failed to insert agent configuration.');
  }
};


export const submitAgentData = async (formData: FormData) => {

  
  try {
    const response = await webHookUrl.post('',formData)
    return response.data;
  } catch (error) {
    console.error('Webhook request failed:', error);
    throw error;
  }
};


export const fetchAgentForEditForm = async( id: string) => {
  try {
    const response = await vocalLabApi.post('', {
      query: `
query MyQuery($id: uuid!) {
  vocallabs_agent_by_pk(id: $id) {
    id
      name
    agent_prompt
    welcome_message
    context_prompt

  }
}
      `,
      variables: { id },
    });
    return response.data.data.vocallabs_agent_by_pk;
  } catch (error) {
    console.error('Error fetching agent configuration:', error);
    throw new Error('Failed to fetch agent configuration.');
  }
};


export const fetchPreviousMappings = async (client_id: string) => {
  try {
    const response = await vocalLabApi.post('', {
      query: `
query MyQuery($client_id: uuid!) {
  vocallabs_call_forwarding_agents(where: { client_id: { _eq: $client_id } }) {
    agent {
      id
      name
    }
    status
    client_id
    provider
  }
}
`,
      variables: { client_id },
    });

    return response
  } catch (error) {
    console.error('Error fetching call forwarding mappings:', error);
    throw new Error('Failed to fetch call forwarding mappings.');
  }
};



export const updateAgentStatus = async (
  client_id: string,
agent_id: string,
  status: string,
  provider: string
) => {
  console.log(provider)
  try {
    
    const response = await vocalLabApi.post('', {
      query: `
mutation MyQuery($client_id: uuid!, $agent_id: uuid!, $provider: String!, $status: String!) {
  vocallabsCallForwadingMapping(request: {agent_id: $agent_id, client_id: $client_id, provider: $provider, status: $status}) {
    mapping
  }
}`,
      variables:{ client_id, agent_id, status,provider },
    });
    console.log(response)
    return response.data || null;
  } catch (error) {
    console.error('Error saving call forwarding mapping:', error);
    throw new Error('Failed to save call forwarding mapping.');
  }
};



export const setCallForwarding = async (
  client_id: string
) => {
  try {
    const response = await vocalLabApi.post('', {
      query: `
query MyQuery($client_id: uuid!) {
  setCallForwarding(request: {client_id: $client_id}) {
    forwarding_phone_number
}
}
      `,
      variables:{ client_id },
    });
    console.log(response)
    return response.data;
  } catch (error) {
    console.error('Error initializing call forwardin:', error);
    throw new Error('Failed to initialize call forwarding.');
  }
};


export const fetchAgents = async (
  client_id: string
) => {
  try {
    const response = await vocalLabApi.post('', {
      query: `
query MyQuery {
  vocallabs_call_forwarding_agents {
    agent_id
    agent {
      name
    }
    status
  }
}
      `
    });
    return response.data.data.vocallabs_call_forwarding_agents[0] || null;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw new Error('Failed to fetch agents.');
  }
};


export const sendGoogleUserData = async (client_id: string, google_state: string) => {
  try {
    // Log variables to ensure correct data

    const response = await vocalLabApi.post('', {
      query: `
        mutation MyQuery($client_id: uuid!, $google_state: String!) {
          vocallabsSaveGoogleAuthState(request: {client_id: $client_id, google_auth_state: $google_state}) {
            google_auth_state
          }
        }
      `,
      variables: {
        client_id,
        google_state,
      },
    });

    // Log the response from the API

    return response.data; // Return the response data if needed

  } catch (error) {
    console.error('Failed sending googleState:', error);
    throw new Error('Failed sending googleState.');
  }
};


export const agentMutation = async ($request: Upload!) => {
  try {
    // Log variables to ensure correct data

    const response = await vocalLabApi.post('', {
      query: `
  mutation GetClientPhone($request: Upload!) {
  vocallabsUpdateAgent(request: $request) {
    agent_id
    message
    success
}
}`,
      variables: {
    request
      },
    });

    // Log the response from the API

    return response.data; // Return the response data if needed

  } catch (error) {
    console.error('Failed sending googleState:', error);
    throw new Error('Failed sending googleState.');
  }
};


export const getAgentTemplates = async ($request: Upload!) => {
  try {

    const response = await vocalLabApi.post('', {
      query: `
query MyQuery {
  vocallabs_agent_templates(where: {is_assistant: {_eq: true}}) {
    id
    language
    name
    welcome_message
    agent_prompt
    inputs_needed
  }
}`,});

    // Log the response from the API
console.log(response.data.data.vocallabs_agent_templates)
  return response.data.data.vocallabs_agent_templates; // Return the response data if needed

  } catch (error) {
    console.error('Failed to get agent templates:', error);
    throw new Error('Failed to get agent templates.');
  }
};


export async function sendTemplateData({
  agent_template_id,
  client_id,
  welcome_message,
  data,
  language,
  name,
  description,
}: {
  agent_template_id: string;
  client_id: string;
  welcome_message: string;
  data: json; // Consider specifying a more detailed type
  name: string;
  description: string;
}) {
  try {

console.log(
    agent_template_id,
    client_id,
    welcome_message,
      language,
    data,
    name,
    description  
)

    const query = `
mutation CreateAgentFromTemplate($client_id: uuid!,$language: String!, $agent_template_id: uuid!, $description: String!, $name: String!, $data: jsonb!, $welcome_message: String!) {
  vocallabsCreateAgentFromAgentTemplate(request: {agent_template_id: $agent_template_id, language: $language, client_id: $client_id, data: $data, description: $description, name: $name, welcome_message: $welcome_message}) {
    message
success
}
}`;

    const variables = {
    agent_template_id,
    client_id,
    welcome_message,
    language,
    data,
    name,
    description  
    };

    const response = await vocalLabApi.post('', {
      query,
      variables,
    });
    console.log(response)
    return response.data;
  } catch (error) {
    console.error("Error in sendTemplateData:", error);
    throw error; // Rethrow for handling at a higher level if needed
  }
}


export async function updateAgentWithContext({
  agent_id,
  client_id,
  welcome_message,
  data,
  language,
  name,
  description,
}: {
  agent_id: string;
  client_id: string;
  welcome_message: string;
  data: any; // Consider specifying a more detailed type
  name: string;
  description: string;
}) {
  try {
    console.log(
      "Agent ID:", agent_id,
      "\nClient ID:", client_id,
      "\nWelcome Message:", welcome_message,
      "\nData:", data,
      "\nName:", name,
      "\nDescription:", description
    );

    const query = `
    mutation GetClientPhone($client_id: uuid!, $agent_id: uuid!, $description: String!, $welcome_message: String!, $name: String!, $data: String!) {
      vocallabsUpdateAgentThroughContext(request: {agent_id: $agent_id, client_id: $client_id, data: $data, name: $name, welcome_message: $welcome_message, description: $description}) {
        message
        success
      }
    }`;

    const variables = {
      agent_id,
      client_id,
      welcome_message,
      data,
      name,
      description
    };

    const response = await vocalLabApi.post('', {
      query,
      variables,
    });

    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Error in updateAgentWithContext:", error);
    throw error; // Rethrow for handling at a higher level if needed
  }
}

export async function getNetworkDetails({
  client_id,
  mobile_number,
}: {
  client_id: string;
  mobile_number: string;
}) {
  try {
    console.log(
      "Client ID:", client_id,
      "\nMobile Number:", mobile_number
    );

    const query = `
    query MyQuery($client_id: uuid!, $mobile_number: String!) {
      vocallabsGetNetworkDetails(request: {client_id: $client_id, mobile_number: $mobile_number}) {
        service_provider
      }
    }`;

    const variables = {
      client_id,
      mobile_number,
    };

    const response = await vocalLabApi.post('', {
      query,
      variables,
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getNetworkDetails:", error);
    throw error; // Rethrow for higher-level handling if necessary
  }
}


export async function getIspProviders() {
  try {
    const query = `
  query MyQuery {
  vocallabs_isp_provider {
    provider
    id
    name
  }
}
`;
    const response = await vocalLabApi.post('', {
      query    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getNetworkDetails:", error);
    throw error; // Rethrow for higher-level handling if necessary
  }
}


export async function removeCallForwarding(provider) {
  try {
    console.log(provider)
    const query = `
      query MyQuery($provider: String!) {
        vocallabs_call_forwarding_codes(
          where: { status: { _eq: "deactivate" }, provider: { _eq: $provider } }
        ) {
          forwarding_code
          provider
          status
          id
        }
      }
    `;

    const variables = { provider };
    const response = await vocalLabApi.post('', {
      query,
      variables,
    });
console.log(response)
    return response.data.data.vocallabs_call_forwarding_codes[0]; // Ensure you return the response data

  } catch (error) {
    console.error("Error removing call forwarding:", error);
    throw error; // Rethrow the error for better debugging
  }
}


export async function CompanyDetailsMutation({
  company_name,
  industry,
  id
}: {
  company_name: string;
  industry: string;
  id: string;
}) {
  console.log(company_name, industry, id)
  try {
    const query = `
     mutation MyMutation($company_name: String!, $industry: String!, $id: uuid!) {
  insert_vocallabs_client(objects: {company_name: $company_name, industry: $industry, id: $id}, on_conflict: {constraint: client_pkey, update_columns: [company_name, industry]}) {
    affected_rows
  }
}`;

    const variables = {company_name, industry, id};
    const response = await vocalLabApi.post('', {
      query,
      variables,
    });
console.log(response)
    return response.data; // Ensure you return the response data

  } catch (error) {
    console.error("Error updating company details:", error);
    throw error; 
  }
}


// 1. Define the shape of each contact object to insert


// 2. Define the function, properly destructuring the argument
export async function SendContactsToDB(contactsData) {
  console.log("Contacts to insert:", contactsData);

  try {
    // Define your mutation
    const query = `
      mutation MyMutation($objects: [vocallabs_users_contacts_data_insert_input!]!) {
        insert_vocallabs_users_contacts_data(objects: $objects) {
          affected_rows
        }
      }
    `;

    // Prepare the variables
    const variables = {
      objects: contactsData,
    };

    // Post to your Hasura or GraphQL API
    // Ensure `vocalLabApi` is an Axios instance or a similar fetch wrapper
    const response = await vocalLabApi.post("", {
      query,
      variables,
    });

    console.log("Hasura insert response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending contacts data:", error);
    throw error;
  }
}


export async function getGTokens(client_id, code, redirect_url) {
  console.log("payload Data:", client_id, code, redirect_url);

  try {
    // Define your mutation
    const query = `
mutation mutation($client_id: uuid!, $code: String!, $redirect_url: String!) {
  vocallabsRefreshToken(request: {client_id: $client_id, code: $code, redirect_url: $redirect_url}) {
    access_token
    refresh_expires_in
    refresh_token
  }
}`;

    const variables = {
      client_id, code, redirect_url
    };

    const response = await vocalLabApi.post("", {
      query,
      variables
    });

    console.log("resposnse from gtokens:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending getting token data:", error);
    throw error;
  }
}


export async function getCompanyName(id) {
  console.log(id)
  try {
    const query = `
  query MyQuery($id: uuid!) {
  vocallabs_client(where: {id: {_eq: $id}}) {
    company_name
  }
}
`;

    const variables = {id};
    const response = await vocalLabApi.post('', {
      query,
      variables,
    });
console.log(response.data.data.vocallabs_client[0].company_name)
if (
  response.data.data.vocallabs_client &&
  response.data.data.vocallabs_client.length > 0 &&
  response.data.data.vocallabs_client[0].company_name &&
  !response.data.data.errors
) {
  return response.data.data.vocallabs_client[0].company_name; 
}

  } catch (error) {
    console.error("Error getting company details:", error);
    throw error; 
  }
}
