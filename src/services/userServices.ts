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
console.log(webHookUrl.defaults.baseURL); 
console.log(formData); 
  
  try {
    const response = await webHookUrl.post('',formData)
    console.log(response)
    return response.data;
  } catch (error) {
    console.error('Webhook request failed:', error);
    throw error;
  }
};


export const fetchAgentsForModal = async( id: string) => {
  console.log(id)
  try {
    const response = await vocalLabApi.post('', {
      query: `
query MyQuery($id: uuid!) {
  vocallabs_agent_by_pk(id: $id) {
    id
    welcome_message
    name
    inputs_needed
  }
}
      `,
      variables: { id },
    });
    return response.data.data.vocallabs_agent;
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
  vocallabs_call_forwarding_agents_by_pk(client_id: $client_id) {
    status
    agent {
      id
      name
}
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
  status: string
) => {
  try {
    const response = await vocalLabApi.post('', {
      query: `
        mutation MyQuery($agent_id: uuid!, $client_id: uuid!, $status: String!) {
  vocallabsCallForwadingMapping(request: {agent_id: $agent_id, client_id: $client_id, status: $status}) {
    mapping
  }
}
      `,
      variables:{ client_id: client_id, agent_id: agent_id, status },
    });
console.log(response)
    return response.data.data.vocallabsCallForwadingMapping?.mapping || null;
  } catch (error) {
    console.log('Error saving call forwarding mapping:', error);
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
console.log(response.data.setCallForwarding)
    return response.data.data.setCallForwarding?.forwarding_phone_number || null;
  } catch (error) {
    console.log('Error initializing call forwardin:', error);
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
console.log(response.data.data.vocallabs_call_forwarding_agents[0])
    return response.data.data.vocallabs_call_forwarding_agents[0] || null;
  } catch (error) {
    console.log('Error fetching agents:', error);
    throw new Error('Failed to fetch agents.');
  }
};


