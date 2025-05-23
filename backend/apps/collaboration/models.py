from django.db import models
from django.contrib.auth.models import User

from apps.common.models import TimeStampedModel


class ResearchCollaborator(models.Model):
    ROLE_CHOICES = (
        ('viewer', 'Viewer'),
        ('contributor', 'Contributor'),
        ('manager', 'Manager'),
    )
    research = models.ForeignKey(
        'research.Research', on_delete=models.CASCADE, related_name='collaborations')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='research_collaborations')
    role = models.CharField(
        max_length=20, choices=ROLE_CHOICES, default='viewer')

    joined_at = models.DateTimeField(auto_now_add=True)
    invited_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='sent_invitations')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()} on {self.research.title}"

    class Meta:
        verbose_name = "Research Collaborator"
        verbose_name_plural = "Research Collaborators"
        unique_together = ('research', 'user')


class CollaborationInvite(TimeStampedModel):
    """
    Model to store collaboration invitations.
    If invitee is null but email is provided, it means invitation to a non-registered user.
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('expired', 'Expired'),
    )
    ROLE_CHOICES = (
        ('viewer', 'Viewer'),
        ('contributor', 'Contributor'),
        ('admin', 'Admin'),
    )

    research_id = models.ForeignKey(
        'research.Research', on_delete=models.CASCADE, related_name='invitations')
    inviter = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_invites')
    invitee = models.ForeignKey(User, on_delete=models.CASCADE,
                                related_name='received_invites', null=True, blank=True)
    # For non-registered users
    email = models.EmailField(blank=True, null=True)
    # ORCID ID format: 0000-0000-0000-0000
    orcid_id = models.CharField(max_length=19, blank=True, null=True)
    role = models.CharField(
        max_length=15, choices=ROLE_CHOICES, default='viewer')
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"Invitation to {self.invitee.username if self.invitee else self.email or self.orcid_id} for {self.research_id}"
