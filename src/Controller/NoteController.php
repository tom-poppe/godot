<?php

namespace App\Controller;

use App\Entity\Note;
use App\Form\NoteType;
use App\Form\ActionType;
use App\Repository\NoteRepository;
use App\Repository\ActionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/note')]
class NoteController extends AbstractController
{
    #[Route('/', name: 'app_note_index', methods: ['GET'])]
    public function index(NoteRepository $noteRepository, Request $request): Response
    {
        $noteId = $request->query->get('n');

        return $this->render('note/index.html.twig', [
            'notes' => $noteRepository->findBy(["user" => $this->getUser()], ["updatedAt" => "DESC"]),
            'selected' => $noteId,
        ]);
    }

    #[Route('/new', name: 'app_note_new', methods: ['GET'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        # Create note and send id
        $note = new Note();

        $note->setContent("Note taken on " . date('d/m/Y') . "\n\n");
        $note->setUser($this->getUser());
        $note->setCreatedAt(new \DateTime('now'));
        $note->setUpdatedAt(new \DateTime('now'));

        $entityManager->persist($note);
        $entityManager->flush();

        return new Response($note->getId());
    }

    #[Route('/{id}/show', name: 'app_note_show', methods: ['GET'])]
    #[IsGranted('access', 'note')]
    public function show(Note $note): Response
    {
        return $this->render('note/show.html.twig', [
            'note' => $note,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_note_edit', methods: ['GET', 'POST'])]
    #[IsGranted('access', 'note')]
    public function edit(Request $request, Note $note, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(NoteType::class, $note);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $note->setUpdatedAt(new \DateTime('now'));
            $entityManager->flush();

            // Create checksum without whitespace
            $checksum = md5(preg_replace('/\s+/', '', $note->getContent()));

            return new Response($checksum);
        }

        return $this->render('note/edit.html.twig', [
            'note' => $note,
            'form' => $form,
        ]);
    }

    #[Route('/{id}/delete', name: 'app_note_delete', methods: ['GET'])]
    #[IsGranted('access', 'note')]
    public function delete(Request $request, Note $note, EntityManagerInterface $entityManager): Response
    {
        $note->setUpdatedAt(new \DateTime('now'));
        $note->setDeletedAt(new \DateTime('now'));

        $entityManager->remove($note);
        $entityManager->flush();

        return new Response("Note deleted");
    }

    #[Route('/{id}/duplicate', name: 'app_note_duplicate', methods: ['GET'])]
    #[IsGranted('access', 'note')]
    public function duplicate(Request $request, Note $note, EntityManagerInterface $entityManager): Response
    {
        $newNote = new Note();

        $newNote->setUser($this->getUser());
        $newNote->setCreatedAt(new \DateTime('now'));
        $newNote->setUpdatedAt(new \DateTime('now'));
        $newNote->setContent("Note copied on " . date('d/m/Y') . "\n\n" . $note->getContent());

        $entityManager->persist($newNote);
        $entityManager->flush();

        return new Response($newNote->getid());
    }

    #[Route('/{id}/add-to-action', name: 'app_note_add_to_action', methods: ['GET', 'POST'])]
    #[IsGranted('access', 'note')]
    public function addToAction(Note $note, Request $request, ActionRepository $actionRepository, EntityManagerInterface $entityManager): Response
    {
     
        


        
        if ($request->query->has('actionId')) {
            $action = $actionRepository->find($request->query->get('actionId'));

            $note->setAction($action);

            $entityManager->flush();

            return $this->redirectToRoute('app_note_index', ["n" => $note->getId()]);   
        }

        $form = $this->createForm(ActionType::class);

        return $this->render('note/_add_to_action.html.twig', [
            'form' => $form,
            'note' => $note,
        ]);
    }
}
