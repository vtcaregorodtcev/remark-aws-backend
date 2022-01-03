import { v4 } from 'uuid';

export default (): ReturnType<typeof v4> => {
  const apiKey = v4();

  console.log('Creating a new SSM Parameter for apiKey. Value:', apiKey);

  return apiKey;
};
