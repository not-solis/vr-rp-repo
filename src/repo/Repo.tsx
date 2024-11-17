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
  return (
    <div className='project-container'>
      {[
        {
          name: 'The Best Roleplay',
          owners: ['solis'],
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
  );
};

export default App;
