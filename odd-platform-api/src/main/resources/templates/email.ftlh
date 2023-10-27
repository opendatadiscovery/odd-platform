<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <title>ODD Platform - ${alertType} Alert</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #333;
        }
        h2 {
            color: #555;
            margin-top: 20px;
        }
        p {
            color: #777;
            margin-bottom: 10px;
        }
        .alert-description {
            background-color: #fff;
            padding: 10px;
            border: 1px solid #ddd;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <h1>Notification Alert</h1>
    <h3>Alert Type: ${alertType}</h3>
    <h3>Event At: ${eventAtTime}</h3>

    <h2>Alerted Data Entity</h2>
    <p>ID: <a href=${link}>${dataEntityId}</a></p>
    <p>Name: ${dataEntityName}</p>
    <p>Data Source: ${dataEntityDataSourceName}</p>
    <p>Namespace: ${dataEntityNamespaceName}</p>
    <p>Type: ${dataEntityType}</p>
    <p>Alert Description: ${alertDescription}</p>
</body>
</html>
