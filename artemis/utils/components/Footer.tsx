import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="h-[80px] border bg-white text-center flex justify-between items-center px-[60px]">
      <div className='flex'>
        <div>
          <span className="font-medium mr-2">Artemis CRM</span>
          <span>&copy; 2021 All Rights Reserved</span>
        </div>

        <div className="flex gap-2 ml-6">
          <Link href={'/change-log'}>
            <a className="crm-link">Change Log</a>
          </Link>
        </div>
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
