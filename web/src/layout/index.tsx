import Nav from '@components/navigation';
import Footer from '@components/footer';

import '@styles/style.css';
import '@styles/nav.css';
import '@styles/footer.css';
import type { RequestContext } from 'brisa';
import { UserHelper } from 'star-kitten-lib/db';
import { getCookies } from '@utils';

export default function Layout({ children }: { children: JSX.Element }, request: RequestContext) {
  // const cookies = getCookies(request.headers);
  // const userId = cookies.currentUser;
  // if (!userId) {
  //   throw new Error('No user found');
  // }
  // const user = User.find(Number(userId));

  const user = UserHelper.find(1);

  return (
    <html lang="en" data-theme="dark">
      <head>
        <title id="title">Brisa</title>
        <meta name="theme-color" content="#ad1457" />
        <link rel="shortcut icon" href="/brisa.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <header>
          <Nav user={user} />
        </header>
        <main>{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}
