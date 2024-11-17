import OAuth2Login from 'react-simple-oauth2-login';

import { DarkModeToggle } from '../components/DarkModeToggle';
import {
  RoleplayApplicationProcess,
  RoleplayEntryProcess,
  RoleplayProject,
  RoleplayStatus,
} from '../components/RoleplayProject';
import './Repo.css';

export const App = () => {
  //https://discord.com/oauth2/authorize?client_id=1307585790292787200&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&scope=identify
  //https://discord.com/oauth2/authorize?client_id=1307585790292787200&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&scope=identify?client_id=1307585790292787200&scope=&redirect_uri=http://localhost:3000/&response_type=token
  //https://discord.com/oauth2/authorize?client_id=1307585790292787200&response_type=token&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&scope=identify?client_id=1307585790292787200&scope=&redirect_uri=http://localhost:3000/
  return (
    <div style={{ height: '100vh' }}>
      <div className='nav'>
        <header>VR Roleplay Repo </header>
        {/* <DarkModeToggle /> */}
        <OAuth2Login
          authorizationUrl='https://discord.com/oauth2/authorize'
          responseType='token'
          clientId='1307585790292787200'
          redirectUri='http://localhost:3000/authcallback'
          onSuccess={(data) => {
            console.log(data);
          }}
          onFailure={(err) => {
            console.log(err);
          }}
          scope='identify'
        />
      </div>
      <div className='project-container'>
        {[
          {
            name: 'The Best Roleplay',
            imageUrl:
              'https://i.kym-cdn.com/photos/images/original/001/240/860/528.png',
            description:
              'This roleplay is incredible. It takes place in the most fantasy place with the most weapony weapons and more dice than you can humanly accept in a given setting.',
            tags: ['cool', 'nice'],
            runtime: [new Date()],
            status: RoleplayStatus.Active,
            entryProcess: RoleplayEntryProcess.Open,
            applicationProcess: RoleplayApplicationProcess.NoApplication,
            hasSupportingCast: true,
            isMetaverse: false,
            isQuestCompatible: true,
            discordUrl: 'http://www.google.com',
            otherLinks: [],
          },
        ].map((p) => (
          <RoleplayProject {...p} />
        ))}
      </div>
    </div>
  );
};

export default App;
