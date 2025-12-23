import { initializeApp, cert } from "firebase-admin/app";
import config from "../../config/index.js";

export const initializeFirebase = () => {
  // Validate required Firebase environment variables
  const requiredFields = [
    "projectId",
    "privateKeyId",
    "privateKey",
    "clientEmail",
    "clientId",
    "authUri",
    "tokenUri",
    "authProviderX509CertUrl",
    "clientX509CertUrl",
  ];

  const missingFields = requiredFields.filter(
    (field) => !config.firebase[field]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingFields.join(
        ", "
      )}`
    );
  }

  const serviceAccount = {
    type: "service_account",
    project_id: config.firebase.projectId,
    private_key_id: config.firebase.privateKeyId,
    private_key: config.firebase.privateKey,
    client_email: config.firebase.clientEmail,
    client_id: config.firebase.clientId,
    auth_uri: config.firebase.authUri,
    token_uri: config.firebase.tokenUri,
    auth_provider_x509_cert_url: config.firebase.authProviderX509CertUrl,
    client_x509_cert_url: config.firebase.clientX509CertUrl,
    universe_domain: config.firebase.universeDomain,
  };

  initializeApp({
    credential: cert(serviceAccount),
    projectId: config.firebase.projectId,
  });
  console.log("Firebase initialized successfully");
};
