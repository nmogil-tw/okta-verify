# Contributing to Okta BYOT + Twilio Verify Demo

Thank you for your interest in contributing! This demo is designed to help Twilio customers understand the Okta BYOT integration.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check existing issues to avoid duplicates
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)
   - Relevant logs or screenshots

### Suggesting Enhancements

We welcome ideas for improvements:

- New features (e.g., voice call support, event replay)
- UI/UX improvements
- Documentation enhancements
- Performance optimizations

Please open an issue with:
- Use case description
- Why it would be valuable
- Proposed implementation (if you have ideas)

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test your changes**
   - Ensure backend and frontend still work
   - Test the complete demo flow
   - Check for console errors
5. **Commit your changes**
   ```bash
   git commit -m "Add feature: description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**
   - Describe what you changed and why
   - Reference related issues
   - Include screenshots for UI changes

## Development Guidelines

### Code Style

- **TypeScript:** Use strict types, avoid `any` when possible
- **React:** Functional components with hooks
- **Naming:** Descriptive variable and function names
- **Comments:** Explain "why" not "what"
- **Formatting:** Prettier-compatible (we'll add config)

### Project Structure

- **Frontend:** React components in `frontend/src/components/`
- **Backend:** Express routes in `backend/src/routes/`
- **Types:** Shared types in both `frontend/src/types/` and `backend/src/types/`
- **Docs:** Markdown files in `docs/`

### Testing

Currently, the project doesn't have automated tests. Contributions to add testing would be welcome:

- Frontend: Jest + React Testing Library
- Backend: Jest + Supertest
- E2E: Playwright or Cypress

### Documentation

When adding features:

- Update README.md if it affects setup or usage
- Update QUICKSTART.md if it changes quick start steps
- Add to docs/SETUP.md for detailed instructions
- Update docs/DEMO_SCRIPT.md if it affects the demo flow

## Enhancement Ideas

Here are some features we'd love to see:

### High Priority

- [ ] Automated tests (frontend + backend)
- [ ] Voice call support in addition to SMS
- [ ] Event replay mode (save/load event streams)
- [ ] Docker support for easier deployment

### Medium Priority

- [ ] Sequence diagram visualization of API flow
- [ ] Configuration wizard for first-time setup
- [ ] Export events as JSON
- [ ] Dark mode UI theme

### Low Priority

- [ ] Multi-session support (multiple demos running)
- [ ] Okta Verify push comparison view
- [ ] Cost calculator based on event volume
- [ ] Analytics dashboard

## Code of Conduct

- Be respectful and constructive
- Focus on the issue, not the person
- Welcome newcomers and help them contribute
- Follow the principle of "demo first, production later"

## Questions?

- Open an issue for technical questions
- Tag maintainers for urgent matters
- Check existing issues and PRs first

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make this demo better for the Twilio and Okta communities!
