// Configure marked for Markdown parsing
marked.setOptions({
    headerIds: true,
    gfm: true,
    breaks: true,
    highlight: function(code, lang) {
        if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
    }
});



class ContentLoader {
    constructor() {
        this.currentSection = 'home';
        this.setupEventListeners();
        this.loadSection('home');
    }

    setupEventListeners() {
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.loadSection(section);
            });
        });
    }

    async loadSection(sectionName) {
        // Update active section
        this.currentSection = sectionName;
        this.updateActiveSection();

        // Load content based on section
        const contentElement = document.getElementById(sectionName);
        try {
            switch(sectionName) {
                case 'home':
                    await this.loadMarkdownContent('Home/index.md', contentElement);
                    break;
                case 'project':
                    await this.loadProjects(contentElement);
                    break;
                case 'current':
                    await this.loadCurrentWork(contentElement);
                    break;
                case 'blog':
                    await this.loadBlogPosts(contentElement);
                    break;
            }
        } catch (err) {
            console.error(`Error loading ${sectionName}:`, err);
            contentElement.innerHTML = '<p>Error loading content</p>';
        }
    }

    async loadMarkdownContent(path, element) {
        const response = await fetch(`../data/${path}`);
        const markdown = await response.text();
        element.innerHTML = marked.parse(markdown);
    }
    async loadMarkdownContent(path, element) {
        try {
            const response = await fetch(`../data/${path}`);
            const markdown = await response.text();
            element.innerHTML = marked.parse(markdown);
            
            // Re-run Prism highlighting on the new content
            element.querySelectorAll('pre code').forEach((block) => {
                block.classList.add('line-numbers');
            });
            Prism.highlightAll();
        } catch (err) {
            console.error('Error loading markdown:', err);
            element.innerHTML = '<p>Error loading content</p>';
        }
    }
    async loadProjects(element) {
        const response = await fetch('../data/project/index.json');
        const allProjects = await response.json();
        
        // Filter completed projects
        const completedProjects = allProjects.filter(project => 
            project.state.toLowerCase() === 'completed'
        );
        
        element.innerHTML = `
            <h2>Projects</h2>
            <div class="projects-grid">
                ${completedProjects.map(project => this.createProjectCard(project)).join('')}
            </div>
        `;
    }
    async loadCurrentWork(element) {
        const response = await fetch('../data/project/index.json');
        const allProjects = await response.json();
        
        // Filter in-progress projects
        const currentProjects = allProjects.filter(project => 
            project.state.toLowerCase() === 'working'
        );
        
        element.innerHTML = `
            <h2>Current Work</h2>
            <div class="projects-grid">
                ${currentProjects.map(project => this.createProjectCard(project)).join('')}
            </div>
        `;
    }
    createProjectCard(project) {
        return `
            <div class="card">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="tags">
                    ${project.tags.map(tag => `
                        <span class="tag">${tag}</span>
                    `).join('')}
                </div>
                ${project.link ? `
                    <a href="${project.link}" 
                       class="project-link" 
                       target="_blank" 
                       title="View Project"
                       rel="noopener noreferrer">
                        View Project →
                    </a>
                ` : ''}
                
            </div>
        `;
    }
    async loadBlogPosts(element) {
        const response = await fetch('../data/blog/index.json');
        const posts = await response.json();
        
        element.innerHTML = `
            <h2>My Blog Posts</h2>
            ${posts.map(post => `
                <div class="card">
                    <article class="post-preview">
                        <h5>
                            <a href="#" data-post="${post.slug}" onclick="app.loadBlogPost(event)" class="post-title">
                                ${post.title}
                            </a>
                        </h5>
                        <time>${new Date(post.date).toLocaleDateString()}</time>
                        <p class="post-excerpt">${post.preview}</p>
                    </article>
                </div>
            `).join('')}
        `;
    }

    async loadBlogPost(event) {
        event.preventDefault();
        const slug = event.target.dataset.post;
        const element = document.getElementById('blog');
        await this.loadMarkdownContent(`blog/${slug}.md`, element);
    }

    updateActiveSection() {
        // Update visible section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(this.currentSection).classList.add('active');

        // Update active nav link
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === this.currentSection) {
                link.classList.add('active');
            }
        });
    }
    
}


// Initialize the app
const app = new ContentLoader();