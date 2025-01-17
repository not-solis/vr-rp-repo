import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardMedia, Typography, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

import { RoleplayProjectSidebar } from './RoleplayProjectSidebar';
import { IconText } from '../components/IconText';
import { TextTag } from '../components/TextTag';
import { ThemedMarkdown } from '../components/ThemedMarkdown';
import { useAuth } from '../context/AuthProvider';
import {
  remapRoleplayProject,
  RoleplayProject,
  RoleplayLink,
} from '../model/RoleplayProject';

import './RoleplayProjectPage.css';

export const RoleplayProjectPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const { id } = useParams();

  const {
    data: project,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () =>
      fetch(`http://localhost:3001/projects/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((json) => {
          const project = json.data;
          return remapRoleplayProject(project);
        }),
  });

  if (error) {
    return <div>Error loading page.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    // ID is invalid
    window.location.href = '/';
    return null;
  }

  // TODO: DELETE
  project.imageUrl = 'https://media1.tenor.com/m/QQiopAKBLyUAAAAd/miber.gif';
  project.description = `
  # Vertit auras ille

## Vana nitidissima fugit portat

Lorem markdownum mihi. Post nunc pater, puerum Cnosia iamque, dei suus ritu,
mixtaeque aries. *Elin est*, et abesse e auctor sanguine fossas. Una virtus
vires; cum discedit defectos, [tueri](http://www.quasfuerat.net/ferrum.php) dum!
Infitianda honoratos longe: **iura**: posse fuit ab siquid est, lateri sequitur
et nisi.

Inbutum faciente, Clytii tu infelix ordine et positus fertur conpositas dedit
palmas numina! Dicta verba, pecudesque *nunc*: poenam patriaque notam, frater
gaudet, ira cum redeamus? Si dicta materiam iungit; nondum non ne domosque
fessos cum rudente poteram, morte. Sua matrem recusat numina precari
[ululatibus](http://dabaturmoly.com/pertimui.aspx) recumbis

### Gloria subit neque

Catenis meritis aliisque natantia dubitet certamine terribili in muros sine.
Fugit finierat mea cetera reddit crescere **Pario** sub velant quorum, illo.

> Nunc tellus, sub nostros inplicuit cineres Talia contenta et altis: et. Dantur
dabat gradu sibi promptu Nise, nec, *a supplex sine*, satis facti.

- Abdita nec nec conpescuit lintea utque
- Adoratis ornabant simul
- In primi fastigia nitidum currum iusto capiunt
- Vestes quidve

## Moveant inpatiens natus

Dabat Oechalia congerie volucres dant caede repellite et certe, proles neque
Bacchus coniunx citus num lecto illo mille. Torvis umeros. Mora alvum erat piae
petit: urbem, opus ille oblivia corpora *Propoetides* aura edidicisse iam nec;
**ubi**.

- Quibus Pyramus fatigat vultu silentia Caenis incinxit
- Macareus ubi eventu stimulis inpune auxiliaris cetera
- Partim volucres
- Saturnia turba
- Flammaeque satis
- Non at victima visa mille nostri coepit

## Redditur vincendo

Vestis qua videant parva si tale ut Asopidos numina: dixit deos impetus in quae.
Prosunt pependit an vulnera nervis.

Tendunt suos parari poscor hominis meorum traherent erat des multiplicique
petebar teneros. Genus profana spolieris, ille coepit solverat et duxit stupuit!
Sortem distinctas *sic* mox molles luridus scitis *aras Iuppiter* manum nunc
cadit cervus vulnera adhuc virentem est dixit iaculo.
  `;

  const { name, description, shortDescription, imageUrl } = project;

  let descriptionElement;
  if (description) {
    descriptionElement = (
      <Typography variant='text'>
        <ThemedMarkdown>{description}</ThemedMarkdown>
      </Typography>
    );
  } else if (shortDescription) {
    descriptionElement = (
      <>
        <Typography variant='subtitle1'>
          (no description provided, using short description)
        </Typography>
        <Typography variant='body1'>{shortDescription}</Typography>
      </>
    );
  } else {
    descriptionElement = (
      <Typography variant='subtitle1'>(no description provided)</Typography>
    );
  }

  return (
    <div className='project-page'>
      <Helmet>
        <title>{name}</title>
        <meta title={name} />
        <meta property='og:title' content={name} />
        <meta property='og:image' content={imageUrl} />
        <meta property='og:image:alt' content={`${name} icon`} />
        <meta property='og:description' content={shortDescription} />
      </Helmet>
      <div className={`project-info${isSidebarOpen ? '' : ' closed'}`}>
        <Typography variant='title'>{project.name}</Typography>
        {descriptionElement}
      </div>
      <RoleplayProjectSidebar
        isOpen={isSidebarOpen}
        toggleOpen={() => setSidebarOpen(!isSidebarOpen)}
        project={project}
      />
    </div>
  );
};
