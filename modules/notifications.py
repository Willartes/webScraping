from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import smtplib
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailNotifier:
    def __init__(self, smtp_config: dict):
        self.smtp_config = smtp_config
    
    async def send_report(self, to_email: str, report_path: str, stats: 'ScrapingStats'):
        msg = MIMEMultipart()
        msg['Subject'] = f'Relatório de Scraping - {datetime.now().strftime("%Y-%m-%d")}'
        msg['From'] = self.smtp_config['user']
        msg['To'] = to_email
        
        body = self._generate_email_body(stats)
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            with open(report_path, 'rb') as f:
                part = MIMEApplication(f.read(), Name=os.path.basename(report_path))
                part['Content-Disposition'] = f'attachment; filename="{os.path.basename(report_path)}"'
                msg.attach(part)
            
            with smtplib.SMTP(self.smtp_config['server'], self.smtp_config['port']) as server:
                server.starttls()
                server.login(self.smtp_config['user'], self.smtp_config['password'])
                server.send_message(msg)
        except Exception as e:
            logger.error(f"Erro ao enviar email: {e}")
            raise
    
    def _generate_email_body(self, stats: 'ScrapingStats') -> str:
        return f"""
Relatório de Scraping

Início: {stats.start_time}
Fim: {stats.end_time}
Total de Items: {stats.total_items}
Total de Páginas: {stats.total_pages}

Erros encontrados: {len(stats.errors)}
Avisos: {len(stats.warnings)}

Este é um email automático. Por favor não responda.
        """.strip()