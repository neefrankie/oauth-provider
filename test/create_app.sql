INSERT INTO backyard.application (
    grant_type,
    client_id,
    client_secret,
    client_name,
    repo_url,
    description,
    callback_url,
    owner_id)
VALUES(
    1,
    'fbaaaef1100071a85fea',
    '482e234b180129b5a4553af5441eb51b0616950c',
    'Web Client Test',
    'https://github.com/neefrankie/oauth-web-client',
    'A Web Client Demo',
    'http://localhost:3000/callback',
    75
), (
    2,
    '730d8375191020615f51',
    '01d9c7c8288af8107de30ce049fbea72892e65f9',
    'AJAX for Web Client',
    'https://github.com/neefrankie/oauth-web-client',
    'Browser app',
    'http://localhost:3000',
    75
);