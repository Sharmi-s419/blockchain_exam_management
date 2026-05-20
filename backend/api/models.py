from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Student', 'Student'),
    )
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='Student')

class Exam(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_published = models.BooleanField(default=False)
    question_paper = models.FileField(upload_to='question_papers/', null=True, blank=True)
    correct_answer_sheet = models.FileField(upload_to='correct_answer_sheets/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    exam = models.ForeignKey(Exam, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    options = models.JSONField(help_text="Format: ['A', 'B', 'C', 'D']")
    correct_answer = models.CharField(max_length=255)
    marks = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.exam.title} - {self.text[:20]}"

class ExamRegistration(models.Model):
    user = models.ForeignKey(User, related_name='registrations', on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, related_name='registrations', on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'exam')

class ExamAttempt(models.Model):
    user = models.ForeignKey(User, related_name='attempts', on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, related_name='attempts', on_delete=models.CASCADE)
    submitted_answers = models.JSONField(blank=True, null=True)
    score = models.IntegerField(null=True, blank=True)
    attendance_status = models.BooleanField(default=True)
    blockchain_tx_hash = models.CharField(max_length=100, blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'exam')
