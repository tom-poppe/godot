<?php

namespace App\Controller;

use App\Entity\Action;
use App\Form\ActionType;
use App\Repository\ActionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/action')]
class ActionController extends AbstractController
{
    #[Route('/', name: 'app_action_index', methods: ['GET'])]
    public function index(ActionRepository $actionRepository, Request $request): Response
    {
        $actionId = $request->query->get('n');

        return $this->render('action/index.html.twig', [
            'actions' => $actionRepository->findBy(["user" => $this->getUser()], ["updatedAt" => "DESC"]),
            'selected' => $actionId,
        ]);
    }

    #[Route('/new', name: 'app_action_new', methods: ['GET'])]
    public function new(Request $request, EntityManagerInterface $entityManager): Response
    {
        # Create action and send id
        $action = new Action();

        $action->setDescription('New action');
        $action->setNextAction(false);
        $action->setUser($this->getUser());
        $action->setCreatedAt(new \DateTime('now'));
        $action->setUpdatedAt(new \DateTime('now'));

        $entityManager->persist($action);
        $entityManager->flush();

        return new Response($action->getId());
    }

    #[Route('/{id}/show', name: 'app_action_show', methods: ['GET'])]
    #[IsGranted('access', 'action')]
    public function show(Action $action): Response
    {
        return $this->render('action/show.html.twig', [
            'action' => $action,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_action_edit', methods: ['GET', 'POST'])]
    #[IsGranted('access', 'action')]
    public function edit(Request $request, Action $action, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(ActionType::class, $action);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $action->setUpdatedAt(new \DateTime('now'));
            $entityManager->flush();

            return $this->redirectToRoute('app_action_index', ["n" => $action->getId()]);
        }

        return $this->render('action/edit.html.twig', [
            'action' => $action,
            'form' => $form,
        ]);
    }

    #[Route('/{id}/delete', name: 'app_action_delete', methods: ['GET'])]
    #[IsGranted('access', 'action')]
    public function delete(Request $request, Action $action, EntityManagerInterface $entityManager): Response
    {
        $action->setUpdatedAt(new \DateTime('now'));
        $action->setDeletedAt(new \DateTime('now'));

        $entityManager->remove($action);
        $entityManager->flush();

        return new Response("Action deleted");
    }

    #[Route('/{id}/duplicate', name: 'app_action_duplicate', methods: ['GET'])]
    #[IsGranted('access', 'action')]
    public function duplicate(Request $request, Action $action, EntityManagerInterface $entityManager): Response
    {
        $newAction = new Action();

        $newAction->setUser($this->getUser());
        $newAction->setCreatedAt(new \DateTime('now'));
        $newAction->setUpdatedAt(new \DateTime('now'));
        $newAction->setContent("Action copied on " . date('d/m/Y') . "\n\n" . $action->getContent());

        $entityManager->persist($newAction);
        $entityManager->flush();

        return new Response($newAction->getid());
    }
}
