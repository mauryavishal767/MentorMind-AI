# MentorMind - AI-Powered Mentoring Platform

MentorMind is a cutting-edge web application that provides personalized AI mentoring experiences. Built with Next.js, Supabase, and integrated with OpenAI and ElevenLabs APIs for intelligent conversations and voice synthesis.

## Features

- 🤖 **AI-Powered Mentors**: Personalized guidance from expert AI mentors
- 🗣️ **Voice Synthesis**: Natural voice conversations using ElevenLabs
- 📊 **Progress Tracking**: Monitor your learning journey with detailed analytics
- 🎯 **Personalized Learning**: Adaptive learning paths based on your goals
- 💬 **Real-time Chat**: Seamless conversation interface with markdown support
- 🏆 **Achievement System**: Track milestones and celebrate progress
- 👥 **Community Features**: Connect with other learners
- 📱 **Responsive Design**: Optimized for all devices
- ♿ **Accessibility**: WCAG 2.1 compliant interface

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI GPT-4 Turbo
- **Voice Synthesis**: ElevenLabs API
- **State Management**: React Hooks
- **Form Handling**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- ElevenLabs API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mentormind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration file in the Supabase SQL editor
   - Enable Row Level Security (RLS)
   - Configure authentication settings

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main tables:

- **profiles**: User profiles and preferences
- **mentors**: AI mentor configurations
- **conversations**: Chat sessions
- **messages**: Individual chat messages
- **learning_paths**: Structured learning journeys
- **progress_tracking**: User progress analytics
- **community_posts**: User-generated content
- **post_reactions**: Community interactions

## API Endpoints

### Internal APIs

- `POST /api/chat` - Generate AI mentor responses
- `POST /api/speech` - Text-to-speech conversion

### External Integrations

- **OpenAI API**: GPT-4 Turbo for intelligent conversations
- **ElevenLabs API**: High-quality voice synthesis
- **Supabase API**: Database operations and authentication

## Key Components

### Authentication
- Secure email/password authentication
- User profile management
- Session management

### Chat System
- Real-time messaging interface
- Markdown message rendering
- Voice message playback
- Conversation history

### Mentor System
- Multiple AI mentor personalities
- Specialized expertise areas
- Customizable mentor selection

### Progress Tracking
- Learning analytics dashboard
- Skill level progression
- Achievement system
- Time tracking

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel (recommended)
   - Netlify
   - AWS Amplify
   - Custom server

3. **Configure environment variables** in your deployment platform

4. **Set up production database** with proper SSL and backups

## Security Features

- Row Level Security (RLS) on all database tables
- Input validation and sanitization
- Secure API key management
- Content Security Policy headers
- HTTPS enforcement

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management
- ARIA labels and descriptions

## Performance Optimizations

- Next.js static site generation
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- Database query optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video call integration
- [ ] Collaborative learning features
- [ ] API for third-party integrations