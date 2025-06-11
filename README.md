# EstimateAI - AI-Powered Construction Estimation Platform

![EstimateAI Logo](https://via.placeholder.com/800x200/2563eb/ffffff?text=EstimateAI+-+Smart+Construction+Estimation)

## 🏗️ Overview

EstimateAI is a cutting-edge web application that revolutionizes construction cost estimation using artificial intelligence. Upload your construction documents, drawings, or specifications, and get detailed cost breakdowns in minutes instead of hours.

### ✨ Key Features

- **🤖 AI-Powered Analysis**: Supports OpenAI GPT-4, Google Gemini, and Anthropic Claude
- **📄 Multi-Format Support**: PDF, CAD files (DWG/DXF), images, Excel sheets, Word documents
- **🌍 Global Localization**: 25+ countries with local currencies and measurement systems
- **💬 Smart Chat Assistant**: Ask questions about your estimates and get expert advice
- **📊 Detailed Reporting**: Comprehensive cost breakdowns with charts and insights
- **🔒 Secure & Private**: User authentication with project-level access control
- **⚡ Real-time Processing**: Watch your documents being analyzed in real-time

## 🚀 Live Demo

[Try EstimateAI Live](https://your-deployment-url.com) *(Replace with your actual deployment URL)*

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/f3f4f6/374151?text=Dashboard+Screenshot)

### File Upload
![File Upload](https://via.placeholder.com/800x400/f3f4f6/374151?text=File+Upload+Screenshot)

### AI Processing
![AI Processing](https://via.placeholder.com/800x400/f3f4f6/374151?text=AI+Processing+Screenshot)

### Results & Analysis
![Results](https://via.placeholder.com/800x400/f3f4f6/374151?text=Results+Screenshot)

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI Integration**: OpenAI, Google AI, Anthropic
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify/Vercel ready

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- At least one AI provider API key (OpenAI, Google AI, or Anthropic)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/estimateai.git
cd estimateai
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration (Choose one or more)
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o

# AI API Keys (You only need one)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration files in the `supabase/migrations/` directory
3. Create a storage bucket named `project-files`
4. Set up Row Level Security policies (included in migrations)

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📋 Detailed Setup Guide

### Supabase Configuration

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Credentials**: Copy your project URL and anon key from Settings > API
3. **Run Migrations**: Execute the SQL files in `supabase/migrations/` in order
4. **Storage Setup**: Create a public bucket named `project-files`

### AI Provider Setup

#### OpenAI (Recommended)
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to your `.env` file as `VITE_OPENAI_API_KEY`

#### Google AI
1. Visit [makersuite.google.com](https://makersuite.google.com)
2. Create an API key
3. Add to your `.env` file as `VITE_GOOGLE_AI_API_KEY`

#### Anthropic
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to your `.env` file as `VITE_ANTHROPIC_API_KEY`

## 🏗️ Project Structure

```
estimateai/
├── src/
│   ├── components/          # React components
│   │   ├── AuthForm.tsx     # User authentication
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── FileUpload.tsx   # Document upload
│   │   ├── ProcessingView.tsx # AI processing display
│   │   ├── EstimationResults.tsx # Results display
│   │   ├── AIChatBot.tsx    # Chat assistant
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API and business logic
│   │   ├── aiProviders.ts   # AI service integration
│   │   ├── fileUpload.ts    # File handling
│   │   └── ...
│   ├── utils/               # Utility functions
│   └── lib/                 # External library configs
├── supabase/
│   └── migrations/          # Database schema
├── public/                  # Static assets
└── ...
```

## 🌍 Supported Countries & Currencies

EstimateAI supports 25+ countries with automatic:
- Currency conversion (USD, EUR, GBP, JPY, CAD, AUD, etc.)
- Measurement system conversion (Metric/Imperial)
- Regional cost adjustments
- Local building standards

## 🔧 Configuration Options

### AI Models

- **OpenAI**: `gpt-4o`, `gpt-4-turbo`, `gpt-4`
- **Google**: `gemini-pro-vision`, `gemini-pro`
- **Anthropic**: `claude-3-sonnet-20240229`, `claude-3-opus-20240229`

### Supported File Types

- **Documents**: PDF, Word (.docx), Text files
- **Drawings**: CAD files (.dwg, .dxf), Images (JPG, PNG, GIF)
- **Spreadsheets**: Excel (.xlsx), CSV files
- **Size Limit**: 50MB per file

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Vercel

1. Import project from GitHub
2. Configure environment variables
3. Deploy with zero configuration

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 API Documentation

### Project Management
- `POST /api/projects` - Create new project
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project details
- `DELETE /api/projects/:id` - Delete project

### File Processing
- `POST /api/projects/:id/files` - Upload files
- `GET /api/projects/:id/files` - List project files
- `POST /api/projects/:id/process` - Start AI processing

## 🔒 Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Row Level Security (RLS) policies
- **File Security**: Secure file upload with type validation
- **Data Privacy**: User data isolation
- **API Security**: Rate limiting and input validation

## 📊 Performance

- **File Processing**: 2-5 minutes for typical projects
- **Accuracy**: 85-98% depending on document quality
- **Supported Languages**: English (with plans for multilingual support)
- **Concurrent Users**: Scales automatically with Supabase

## 🐛 Troubleshooting

### Common Issues

**Upload Errors**
- Check Supabase storage bucket permissions
- Verify file size limits (50MB max)
- Ensure file types are supported

**AI Processing Fails**
- Verify AI API keys are correct
- Check API rate limits
- Ensure sufficient API credits

**Authentication Issues**
- Verify Supabase URL and keys
- Check email confirmation settings
- Review RLS policies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [OpenAI](https://openai.com) for GPT-4 Vision capabilities
- [Tailwind CSS](https://tailwindcss.com) for the beautiful styling
- [Lucide](https://lucide.dev) for the icon library

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/estimateai/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/estimateai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/estimateai/discussions)
- **Email**: support@estimateai.com

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced CAD file support
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Machine learning model training
- [ ] Multi-language support
- [ ] Advanced reporting and analytics

---

**Built with ❤️ for the construction industry**

*EstimateAI - Making construction estimation faster, smarter, and more accurate.*