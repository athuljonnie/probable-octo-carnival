//userServices.ts
import { growApi, vocalLabApi, webHookUrl } from './api';

// Function to request OTP
export const requestOtp = async (phoneNumber: string) => {
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
    query:`
query MyQuery($client_id: uuid!) {vocallabsGetAgentsElseCreateDefault(request: {client_id: $client_id}) {
agents
}
}`,
      variables: { client_id },
    });
    return response.data.data.vocallabsGetAgentsElseCreateDefault.agents;
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
    return response.data.data.setCallForwarding?.forwarding_phone_number || null;
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
  vocallabs_agent_templates {
    id
    language
    name
    welcome_message
}
}`,});

    // Log the response from the API

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
  data: any; // Consider specifying a more detailed type
  name: string;
  description: string;
}) {
  try {



    const query = `
mutation CreateAgentFromTemplate($client_id: uuid!, $agent_template_id: uuid!, $description: String!, $welcome_message: String!, $name: String!, $data: String!) {
  vocallabsCreateAgentFromAgentTemplate(request: {agent_template_id: $agent_template_id, client_id: $client_id, data: $data, description: $description, welcome_message: $welcome_message, name: $name}) {
    agent_id
    message
success
}
}`;

    const variables = {
    agent_template_id,
    client_id,
    welcome_message,
    data: data.file_base64,
    name,
    description  
    };

    const response = await vocalLabApi.post('', {
      query,
      variables,
    });
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

    console.log(response.data);
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


