const { PubSub } = require('@google-cloud/pubsub');
const { v4: uuidv4 } = require('uuid');
const mailgun = require('mailgun-js');
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.HOST,
  dialect: 'mysql',
  timezone: '+00:00',
});
// Define User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4, 
      primaryKey: true,
      allowNull: false,
    },
    // Attributes for the User model
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "First name cannot be empty",
        },
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Last name cannot be empty",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password cannot be empty",
        },
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Invalid email format",
        },
      },
    },
    account_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    account_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, 
    },
    token: {
      type: DataTypes.UUID, 
      defaultValue: null, 
    },
    validity_time: {
      type: DataTypes.DATE, 
      defaultValue: null, 
    },
  },
  {
    timestamps: false 
  })

const mg =  mailgun({
  apiKey: '71bd69a940f3b74a0b6e17218a5e6bed-309b0ef4-201c27e7',
  domain: 'mycloudwebapp.me' 
});


// Create a Pub/Sub client
const pubsub = new PubSub();
const currentTime = new Date();

exports.handleNewUserAccount = async (event, context) => {
  const pubsubMessage = event.data ? JSON.parse(Buffer.from(event.data, 'base64').toString()) : {};
  const { id: userId, username: userEmail } = pubsubMessage;
  // Generate verification token
  const verificationToken = uuidv4();
  // Send email verification link to the user
  await sendVerificationEmail(userEmail, verificationToken);
  const validityTime = new Date(Date.now() + 2 * 60 * 1000);
  await updateDatabase(userEmail, verificationToken, validityTime);
  console.log(`Verification email sent to ${userEmail}`);
};

async function sendVerificationEmail(userEmail, verificationToken) {
  try {
    const apiKey = "71bd69a940f3b74a0b6e17218a5e6bed-309b0ef4-201c27e7";
    const domain = "mycloudwebapp.me";
    const sender = "mail@mycloudwebapp.me";
    const data = {
      from: sender,
      to: userEmail,
      subject: 'Email Verification',
       text: `Please click the following link to verify your email: ${generateVerificationLink(userEmail, verificationToken)}`,
    };
    const body = await mg.messages().send(data);
    console.log('Mailgun response:', body);
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw error; 
  }
}

function generateVerificationLink(userEmail,verificationToken) {
    const baseUrl = 'http://mycloudwebapp.me:8080';
    const verificationLink = `${baseUrl}/verify-email?username=${userEmail}&token=${verificationToken}`; 
    return verificationLink;
  }

  // Function to update db
async function updateDatabase(userEmail, verificationToken, validityTime) {
  try {
    const [rowsAffected] = await User.update(
      { token: verificationToken, validity_time: validityTime },
      { where: { username: userEmail } }
    );
    console.log(`Updated ${rowsAffected} row(s)`);
  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  }
}
