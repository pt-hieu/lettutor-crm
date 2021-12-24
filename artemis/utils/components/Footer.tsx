export default function Footer() {
  return (
    <footer className="h-[80px] text-center flex justify-between items-center px-[60px]">
      <div>
        <span className="font-medium mr-2">CRM System</span>
        <span>&copy; 2021 All Rights Reserved</span>
      </div>
      <div className="flex gap-2">
        <a
          className="crm-link"
          target="_blank"
          href="https://github.com/pt-hieu/lettutor-crm"
        >
          <span className="fab fa-github" />
        </a>
      </div>
    </footer>
  )
}
