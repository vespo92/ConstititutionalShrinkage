# Constitutional Shrinkage Mobile App

React Native mobile application for citizen governance participation. Built with Expo and React Native, this app provides full feature parity with the web portal, allowing citizens to vote on legislation, manage delegations, and stay informed about governance activities from anywhere.

## Features

- **Secure Authentication**: Email/password login with biometric options (Face ID / Touch ID)
- **Legislation Browser**: Search and explore bills with filtering and detailed views
- **Voting Interface**: Mobile-optimized voting with haptic feedback and offline support
- **Delegation Management**: View and manage vote delegations
- **Push Notifications**: Stay informed about voting sessions and bill updates
- **Offline Support**: Queue votes when offline and sync when connectivity is restored

## Tech Stack

- **Framework**: React Native with Expo SDK 50
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **UI**: Custom component library with consistent theming
- **Security**: Expo SecureStore, LocalAuthentication, and certificate pinning
- **Notifications**: Expo Notifications with scheduled reminders

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Environment Configuration

Create a `.env` file in the root:

```env
API_URL=https://api.constitutional-shrinkage.gov
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/            # Tab navigation screens
│   │   ├── auth/              # Authentication screens
│   │   ├── bill/              # Bill detail screens
│   │   └── vote/              # Voting screens
│   ├── components/            # Reusable components
│   │   ├── ui/                # Core UI components
│   │   ├── bills/             # Bill-related components
│   │   ├── voting/            # Voting components
│   │   ├── delegation/        # Delegation components
│   │   └── common/            # Shared components
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API and service layer
│   ├── store/                 # Zustand state stores
│   ├── utils/                 # Utility functions
│   └── constants/             # Theme and constants
├── app.json                   # Expo configuration
├── eas.json                   # EAS Build configuration
└── package.json
```

## Building for Production

### Using EAS Build

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Build for both platforms
npm run build:all
```

### App Store Submission

```bash
# Submit to app stores
npm run submit
```

## Security Features

- **Biometric Authentication**: Face ID / Touch ID for login and vote confirmation
- **Secure Storage**: Sensitive data stored in Keychain (iOS) / Keystore (Android)
- **Certificate Pinning**: API communication secured against MITM attacks
- **App Attestation**: Play Integrity (Android) and App Attest (iOS)
- **Vote Signing**: Cryptographic signatures for vote verification

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## License

This project is part of the Constitutional Shrinkage platform. See [LICENSE](../../LICENSE) for details.
