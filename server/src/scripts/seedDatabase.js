import db from '../utils/prisma.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.agent.deleteMany({});
    await db.team.deleteMany({});

    // Define teams and their agents
    const teamsData = [
      {
        name: "Seals Automation",
        description: "Specialized automation and development team for streamlined processes",
        agents: [
          { name: "Requirements", description: "Analyze and document project requirements", icon: "FileTextOutlined", order: 1 },
          { name: "Planning", description: "Create project structure and roadmap", icon: "ProjectOutlined", order: 2 },
          { name: "Design", description: "Generate system architecture and UI design", icon: "SketchOutlined", order: 3 },
          { name: "Development", description: "Write and implement application code", icon: "CodeOutlined", order: 4 },
          { name: "Testing", description: "Execute comprehensive testing procedures", icon: "BugOutlined", order: 5 },
          { name: "CI/CD", description: "Deploy and configure continuous integration", icon: "RocketOutlined", order: 6 }
        ]
      },
      {
        name: "GD Simplification Macro",
        description: "General development simplification and macro automation specialists",
        agents: [
          { name: "Requirements", description: "Analyze and document project requirements", icon: "FileTextOutlined", order: 1 },
          { name: "Planning", description: "Create simplified project structure", icon: "ProjectOutlined", order: 2 },
          { name: "Design", description: "Generate simplified system design", icon: "SketchOutlined", order: 3 },
          { name: "Development", description: "Write and implement simplified code", icon: "CodeOutlined", order: 4 },
          { name: "Testing", description: "Execute streamlined testing", icon: "BugOutlined", order: 5 },
          { name: "CI/CD", description: "Automated deployment pipeline", icon: "RocketOutlined", order: 6 }
        ]
      }
    ];

    // Create teams and agents
    for (const teamData of teamsData) {
      console.log(`📊 Creating team: ${teamData.name}`);

      const team = await db.team.create({
        data: {
          name: teamData.name,
          description: teamData.description
        }
      });

      console.log(`✅ Created team: ${team.name} (ID: ${team.id})`);

      // Create agents for this team
      for (const agentData of teamData.agents) {
        const agent = await db.agent.create({
          data: {
            name: agentData.name,
            description: agentData.description,
            icon: agentData.icon,
            order: agentData.order,
            teamId: team.id
          }
        });

        console.log(`  ➕ Created agent: ${agent.name} for team ${team.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');

    // Verify the data
    const teamCount = await db.team.count();
    const agentCount = await db.agent.count();
    console.log(`📈 Created ${teamCount} teams and ${agentCount} agents`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
};

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('✨ Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });